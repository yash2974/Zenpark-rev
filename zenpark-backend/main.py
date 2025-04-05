from fastapi import FastAPI,HTTPException
from pydantic import BaseModel,EmailStr
from pymongo import MongoClient
from dotenv import load_dotenv
import os

app = FastAPI()
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["zenparkdb"]
collection = db["userrequests"]

class User(BaseModel):
    name: str
    organization: str
    registrationNumber: str
    mobileNumber: str
    email: EmailStr
    password: str

@app.post("/register")
def register_user(user: User):
    if collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    
    collection.insert_one(user.model_dump())
    return {"message": "User registered successfully"}