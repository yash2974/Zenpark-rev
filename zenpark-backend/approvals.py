from fastapi import FastAPI, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pymongo import MongoClient
import os

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your React app URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client["zenparkdb"]
collection = db["userrequests"]

@app.get("/pending-approvals")
async def get_pending_approvals(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    skip = (page - 1) * limit
    approvals = await collection.find().skip(skip).limit(limit).to_list(length=limit)
    
    for approval in approvals:
        approval["_id"] = str(approval["_id"])
    
    return {
        "approvals": approvals,
        "page": page,
        "limit": limit,
        "total": await collection.count_documents({}),
    }
