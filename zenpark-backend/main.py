from bson import ObjectId
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import mysql.connector
load_dotenv()
app = FastAPI()

mysql_conn = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE")
)
mysql_cursor = mysql_conn.cursor()





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
vehicles_collection = db["vehicleapprovalrequests"]

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


class VehicleRegisterRequest(BaseModel):
    vehicle_number: str
    rc_number: str
    license_number: str
    vehicle_type: str


@app.post("/register-vehicle/{uid}")
async def register_vehicle(uid: str, payload: VehicleRegisterRequest):
    user = await users_collection.find_one({"uid": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fix: Check if this vehicle is already registered (approved)
    # Since vehicle is stored as strings, directly check if the vehicle number exists in the array
    vehicle_list = user.get("vehicle", [])
    if payload.vehicle_number in vehicle_list:
        raise HTTPException(status_code=400, detail="Vehicle already approved and registered.")

    # Check if it's already in the unapproved collection
    duplicate = await vehicles_collection.find_one({
        "uid": uid,
        "vehicle_number": payload.vehicle_number
    })
    if duplicate:
        raise HTTPException(status_code=400, detail="Vehicle is already pending approval.")

    # Save to unapproved vehicles
    await vehicles_collection.insert_one({
        "uid": uid,
        **payload.dict()
    })

    return {"message": "Vehicle submitted for approval"}

@app.get("/unapproved-vehicles")
async def get_unapproved_vehicles(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    skip = (page - 1) * limit
    vehicles = await vehicles_collection.find().skip(skip).limit(limit).to_list(length=limit)
    for vehicle in vehicles:
        vehicle["_id"] = str(vehicle["_id"])
    total = await vehicles_collection.count_documents({})
    return {"vehicles": vehicles, "page": page, "limit": limit, "total": total}

@app.post("/approve-vehicle/{_id}")
async def approve_vehicle(_id: str):
    if not ObjectId.is_valid(_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    
    vehicle = await vehicles_collection.find_one({"_id": ObjectId(_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    user = await users_collection.find_one({"uid": vehicle["uid"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Add vehicle to user's approved list in MongoDB
    await users_collection.update_one(
        {"uid": vehicle["uid"]},
        {"$push": {"vehicle": vehicle["vehicle_number"]}}
    )

    # Insert into MySQL
    try:
        insert_query = """
        INSERT INTO approved_vehicles (uid, vehicle_number, rc_number, license_number, vehicle_type)
        VALUES (%s, %s, %s, %s, %s)
        """
        mysql_cursor.execute(insert_query, (
            vehicle["uid"],
            vehicle["vehicle_number"],
            vehicle["rc_number"],
            vehicle["license_number"],
            vehicle["vehicle_type"]
        ))
        mysql_conn.commit()
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"MySQL Error: {err}")

    # Remove from pending collection
    await vehicles_collection.delete_one({"_id": ObjectId(_id)})

    return {"message": "Vehicle approved successfully"}


@app.post("/reject-vehicle/{_id}")
async def reject_vehicle(_id: str):
    if not ObjectId.is_valid(_id):
        raise HTTPException(status_code=400, detail="Invalid vehicle ID")
    
    vehicle = await vehicles_collection.find_one({"_id": ObjectId(_id)})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    await vehicles_collection.delete_one({"_id": ObjectId(_id)})
    
    return {"message": "Vehicle rejected successfully"}
   


