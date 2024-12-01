from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Annotated
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
from dotenv import load_dotenv
import os
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from db import productCollections, employeeCollection, collection, client, Employee,Product,SaleRecord,Owner   

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


router = APIRouter()
async def get_employee(collection, username: str):
    user = await employeeCollection.find_one({"username": username})
    if user:
        user["_id"] = str(user["_id"])  
        return user
    return None
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    user_data = await employeeCollection.find_one({"username": token})  
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Employee(**user_data)


@router.get("/allproducts", response_model=list[str])
async def get_all_product_names():
    try:
        products = await productCollections.find({}, {"productName": 1, "_id": 0}).to_list(length=None)
        product_names = [product["productName"] for product in products]
        return product_names
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching product names: {str(e)}")

class SellProductRequest(BaseModel):
    date: str
    number_of_items: int

@router.post("/sell/{productName}")
async def sell_product(current_user: Annotated[Employee, Depends(get_current_user)],productName: str, sell_info: SellProductRequest):
    try:
        product = await productCollections.find_one({"productName": productName})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        employee_username = current_user.username
        print(employee_username)
        employee_wallet = current_user.employeeWallet or 0  

        total_amount = product['price'] * sell_info.number_of_items
        owner_amount = total_amount * (product['ownerPercentage'] / 100)
        employee_amount = total_amount * (product['secondLevelPercentage'] / 100)
        reference_amount = total_amount * (product['thirdLevelPercentage'] / 100)
        company_amount = total_amount - (owner_amount + employee_amount + reference_amount)

        result = await employeeCollection.update_one(
            {"username": employee_username},
            {"$inc": {"employeeWallet": employee_amount}},
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")

        reference_employee = await employeeCollection.find_one({"username": employee_username})
        if reference_employee and reference_employee.get('reference'):
            reference_employee_username = reference_employee['reference']
            await employeeCollection.update_one(
                {"username": reference_employee_username},
                {"$inc": {"employeeWallet": reference_amount}}
            )
            
        
        owner = await client['OwnerInfo']['OwnerInfo'].find_one({"username": "john_doe"})  
        if owner:
            await client['OwnerInfo']['OwnerInfo'].update_one(
                {"username": "john_doe"},
                {"$inc": {"ownerWallet": owner_amount}}
            )

        await client['OwnerInfo']['OwnerInfo'].update_one(
            {"username": "john_doe"},
            {"$inc": {"companyWallet": company_amount}}
        )

        sale_record = {
            "productName": productName,
            "date": sell_info.date,
            "number_of_items": sell_info.number_of_items,
            "total_price": total_amount,
            "sold_by": employee_username,  
        }

        await productCollections.update_one(
            {"productName": productName},
            {"$push": {"sales": sale_record}}
        )

        return {"message": "Product sold successfully, wallets updated and sale logged!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#Employee login related code begins


@router.post("/login")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await employeeCollection.find_one({"username": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username")
    if form_data.password != user["password"]:
        raise HTTPException(status_code=400, detail="Incorrect password")
    return {"access_token": user["username"], "token_type": "bearer"}

@router.get("/allproducts", response_model=list[dict])
async def get_all_products():
    try:
        # Fetch all product details from the database
        products = await productCollections.find().to_list(length=None)
        if not products:
            raise HTTPException(status_code=404, detail="No products found.")
        return products  # Return the full product objects with all details
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching products: {str(e)}")


@router.get("/currentuser", response_model=Employee)
async def get_current_user_info(current_user: Annotated[Employee, Depends(get_current_user)]):
    return current_user
