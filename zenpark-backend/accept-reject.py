from fastapi import FastAPI, HTTPException
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import os

app = FastAPI()
client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client["zenparkdb"]
user_requests = db["userrequests"]
users = db["users"]

@app.post("/approve/{user_id}")
async def approve_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await user_requests.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await users.insert_one(user)
    await user_requests.delete_one({"_id": ObjectId(user_id)})
    return {"message": "User approved successfully"}

@app.delete("/reject/{user_id}")
async def reject_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    result = await user_requests.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User request rejected successfully"}

