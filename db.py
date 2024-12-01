import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from typing import Optional, List



load_dotenv()
MONGO_URI = os.getenv("mongo_uri")


class Owner(BaseModel):
    username: str
    fullName: str
    password: str
    email: EmailStr
    number: str
    age: str
    ownerWallet: float =0.0 
    companyWallet: float =0.0 

class SaleRecord(BaseModel):
    date: str
    number_of_items: int
    total_price: float =0.0
    sold_by: str

class Product(BaseModel):
    productName: str
    details: str | None = None
    price: float =0.0
    ownerPercentage: float =0.0
    secondLevelPercentage: float =0.0
    thirdLevelPercentage: float =0.0
    sales: Optional[List[SaleRecord]] = []


class Employee(BaseModel):
    username: str
    fullName: str
    password: str
    email: EmailStr
    number: str
    reference: str | None = None
    employeeWallet: float =0.0

client = AsyncIOMotorClient(MONGO_URI)
db = client["OwnerInfo"]
collection = db["OwnerInfo"]
productCollections = db["Products"]
employeeCollection = db["Employees"]
