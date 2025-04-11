from bson import ObjectId
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Async MongoDB
client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client["zenparkdb"]
users_collection = db["users"]
requests_collection = db["userrequests"]

# ---------------------- Routes ----------------------

# 1. Get user by UID
@app.get("/user/{uid}")
async def get_user_by_uid(uid: str):
    user = await users_collection.find_one({"uid": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user

# 2. Register new user request
class User(BaseModel):
    uid: str
    name: str
    mobileNumber: str
    organization: str
    vehicle: List[str]
    admin: bool
    registrationNumber: str
    email: EmailStr
    status: bool

@app.post("/register")
async def register_user(user: User):
    existing = await requests_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    await requests_collection.insert_one(user.model_dump())
    return {"message": "User registered successfully"}

# 3. Get pending approvals with pagination
@app.get("/pending-approvals")
async def get_pending_approvals(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    skip = (page - 1) * limit
    approvals = await requests_collection.find().skip(skip).limit(limit).to_list(length=limit)
    for approval in approvals:
        approval["_id"] = str(approval["_id"])
    total = await requests_collection.count_documents({})
    return {"approvals": approvals, "page": page, "limit": limit, "total": total}

# 4. Accepting pending requests
@app.post("/approve/{_id}")
async def approve_user(_id: str):
    if not ObjectId.is_valid(_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await requests_collection.find_one({"_id": ObjectId(_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Approval user not found")
    
    user["status"] = True

    await users_collection.insert_one(user)
    await requests_collection.delete_one({"_id": ObjectId(_id)})
    
    return {"message": "User approved successfully"}

# 5. Rejecting pending requests

@app.post("/reject/{_id}")
async def reject_user(_id: str):
    if not ObjectId.is_valid(_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await requests_collection.find_one({"_id": ObjectId(_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Approval user not found")
    
    await requests_collection.delete_one({"_id": ObjectId(_id)})
    
    return {"message": "User rejected successfully"}