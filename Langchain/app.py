import json
import os
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from prompt.prompt1 import findPrompt
from prompt.prompt1 import cartPrompt
from prompt.prompt1 import decisionPrompt
import traceback

load_dotenv()

app = FastAPI()

# Allow requests from Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_api_key = os.getenv("GROQ_API_KEY")


mongo_uri = os.getenv("MONGO_URI")  
db_name = "test"
collection_name = "products"


client = AsyncIOMotorClient(mongo_uri)
db = client[db_name]
collection = db[collection_name]


llm = ChatGroq(model_name="mixtral-8x7b-32768", temperature=0.7)

# Input model
class QueryRequest(BaseModel):
    query: str

def parse_name_field(name_field: str):
    try:
        match = re.search(
            r"FindAllProducts\((\[[^]]*\]),\s*\[([^]]*)\],\s*(.*?),\s*(.*?),\s*(\d+|null)\)",
            name_field,
        )

        if match:
            product_names = json.loads(match.group(1).replace("'", '"'))
            categories = [cat.strip().strip("'") for cat in match.group(2).split(",") if cat.strip()]
            price = match.group(3).strip().strip("'") if match.group(3) != "null" else None
            discount = match.group(4).strip().strip("'") if match.group(4) != "null" else None
            quantity = int(match.group(5)) if match.group(5) != "null" else None

            price_filter = parse_price_or_discount(price)
            discount_filter = parse_price_or_discount(discount)

            return product_names, categories, price_filter, discount_filter, quantity
    except Exception as e:
        print(f"Error parsing name field: {e}")

    return [], [], None, None, None

# Helper function to convert price/discount filters to MongoDB query format
def parse_price_or_discount(value):
    if not value:
        return None
    if value.startswith("<"):
        return {"$lt": int(value[1:])}
    if value.startswith(">"):
        return {"$gt": int(value[1:])}
    return {"$eq": int(value)}

# MongoDB query function
async def fetch_products(product_names, categories, price_filter, discount_filter, quantity):
    query = {"available": True}

    if product_names:
        query["name"] = {"$in": product_names}
    
    if categories:
        query["category"] = {"$in": categories}
    
    if price_filter:
        query["price"] = price_filter
    
    if discount_filter:
        query["discount"] = discount_filter

    print("MongoDB Query:", query)

    try:
        cursor = collection.find(query,{"_id":0}).limit(quantity if quantity else 0)
        products = await cursor.to_list(length=quantity if quantity else 100)  # Default limit 100
        return products
    except Exception as e:
        print(f"MongoDB Fetch Error: {e}")
        return []


@app.post("/find")
async def handle_query(request: QueryRequest):
    productChain = findPrompt | llm
    try:
        response = await productChain.ainvoke({"input": request.query})
        response_json = json.loads(response.content)

        name_field = response_json.get("name", "")
        if name_field and "FindAllProducts" in name_field:
            product_names, categories, price_filter, discount_filter, quantity = parse_name_field(name_field)
            products = await fetch_products(product_names, categories, price_filter, discount_filter, quantity)

            return {
                "message": response_json.get("message", "Here are your products!"),
                "data": products,
            }
        
        return {"message": response_json.get("message", "I am here to help!")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
    
@app.post("/cart")
async def cartManage(request : QueryRequest):
    chain = cartPrompt | llm
    try:
        response=await chain.ainvoke({"input":request.query})
        response_json=json.loads(response.content)
        print (response_json)
        return response_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
    
@app.post("/route-query")
async def route_query(request: QueryRequest):
    classification_chain = decisionPrompt | llm
    try:
        response = await classification_chain.ainvoke({"input": request.query, "message": ""})
        response_json = json.loads(response.content)
        print(response_json)
        if response_json["role"] == "Cart":
            return await cartManage(request)  
        elif response_json["role"] == 'Find':
            return await handle_query(request)
        elif response_json["role"] == 'general':
            return response_json
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
       
      
        

    
