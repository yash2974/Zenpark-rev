from fastapi import FastAPI, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pymongo import MongoClient
import os
import asyncio


load_dotenv()
app = FastAPI()
print(os.getenv("MONGO_URI"))


# CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your React app URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client["zenparkdb"]
collection = db["users"]

@app.get("/user/{uid}")
async def get_user_by_uid(uid: str):
    print("Querying for UID:", uid)
    user = await collection.find_one({"uid": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user