from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated, List, Optional
from pydantic import BaseModel, EmailStr
from datetime import date
from bson import ObjectId
from employee import router as employee_router
from db import collection, productCollections, employeeCollection, client, Employee,Product,SaleRecord,Owner  
from motor.motor_asyncio import AsyncIOMotorClient

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def ping_db():
    try:
        await client.admin.command("ping")  # Ping the MongoDB server
        print("Database is connected!")
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise e


app = FastAPI(on_startup=[ping_db])  

async def get_owner(collection, username: str):
    user = await collection.find_one({"username": username})
    if user:
        user["_id"] = str(user["_id"])  
        return user
    return None


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    user = await get_owner(collection, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.get("/")
async def root():
    return {"message": "Hello, world!"}


@app.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await collection.find_one({"username": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username")
    if form_data.password != user["password"]:
        raise HTTPException(status_code=400, detail="Incorrect password")
    return {"access_token": user["username"], "token_type": "bearer"}


@app.post("/owner-register")
async def register_owner(owner: Owner):
    existing_owner = await collection.find_one(
        {"$or": [{"username": owner.username}, {"email": owner.email}]}
    )
    if existing_owner:
        raise HTTPException(status_code=400, detail="This user already exists")
    owner_dict = owner.model_dump()
    await collection.insert_one(owner_dict)
    return {"message": "Registration successful"}


@app.get("/get-owner")
async def read_owner(current_user: Annotated[Owner, Depends(get_current_user)]):
    return current_user


@app.post("/add_product")
async def add_product(
    current_user: Annotated[Owner, Depends(get_current_user)], product: Product
):
    existing_product = await productCollections.find_one(
        {"productName": product.productName}
    )
    if existing_product:
        raise HTTPException(status_code=400, detail="This product is already added")
    product_dict = product.model_dump()
    await productCollections.insert_one(product_dict)
    return {"message": "Product has been added!"}

@app.get("/products", response_model=List[Product])
async def get_product(
):
    try:
        data = await productCollections.find().to_list(length=100)  
        if not data:
            raise HTTPException(status_code=404, detail="No products found.")
        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/get-employee", response_model=List[Employee])
async def get_employee(
    current_user: Annotated[Owner, Depends(get_current_user)]
):
    try:
        data= await employeeCollection.find().to_list()
        if not data:
            raise HTTPException(status_code=404, detail="Not  found.")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occured")


@app.put("/edit_product/{product_name}")
async def edit_product(
    product_name: str,
    product: Product,
    current_user: Annotated[Owner, Depends(get_current_user)],
):
    existing_product = await productCollections.find_one({"productName": product_name})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    updated_product = product.model_dump()
    result = await productCollections.update_one(
        {"productName": product_name}, {"$set": updated_product}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated successfully"}


@app.delete("/delete-product/{productName}")
async def delete_product(
    productName: str,
    current_user: Annotated[Owner, Depends(get_current_user)]
    
):
    try:
        product = await productCollections.find_one({"productName": productName})
        
        if not product:
            raise HTTPException(
                status_code= 404,
                detail="Product is not available to delete"
            )
            
        result = await productCollections.delete_one({"productName": productName})
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=500, 
                detail="Failed to delete."
            )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred while deleting the employee: {str(e)}"
        )




@app.post("/add_employee")
async def add_employee(
    current_user: Annotated[Owner, Depends(get_current_user)], employee: Employee
):
    existing_employee = await employeeCollection.find_one(
        {"$or": [{"username": employee.username}, {"email": employee.email}]}
    )
    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="An employee with this username or email already exists",
        )
    employee_dump = employee.model_dump()
    await employeeCollection.insert_one(employee_dump)
    return {"message": "A new employee has been added!"}

@app.delete("/delete_employee/{username}")
async def delete_employee(
    username: str, 
    current_user: Annotated[Owner, Depends(get_current_user)]
):
    try:
        employee = await employeeCollection.find_one({"username": username})
        
        if not employee:
            raise HTTPException(
                status_code=404, 
                detail=f"Employee with username '{username}' not found."
            )
        
        result = await employeeCollection.delete_one({"username": username})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to delete employee with username '{username}'."
            )

        return {"message": f"Employee with username '{username}' has been deleted successfully!"}
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred while deleting the employee: {str(e)}"
        )



app.include_router(employee_router, prefix="/employee")
