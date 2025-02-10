import json
import os
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_groq import ChatGroq
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from prompt.prompt1 import prompt

load_dotenv()

app = FastAPI()

# Set Groq API key
groq_api_key = os.getenv("GROQ_API_KEY")

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI")  # Store this in your .env file
db_name = "test"
collection_name = "products"

# Initialize MongoDB client
client = AsyncIOMotorClient(mongo_uri)
db = client[db_name]
collection = db[collection_name]

# Initialize Groq LLM
llm = ChatGroq(model_name="mixtral-8x7b-32768", temperature=0.7)
chain = prompt | llm

# Input model
class QueryRequest(BaseModel):
    query: str

# Function to parse the "name" field from JSON response
def parse_name_field(name_field: str):
    try:
        match = re.search(r"FindAllProducts\((\[[^]]*\]),\s*\[([^]]*)\],\s*(.*?),\s*(.*?)\)", name_field)
        
        if match:
            # Extracting and sanitizing fields
            product_names = json.loads(match.group(1).replace("'", '"'))
            categories = [cat.strip().strip("'") for cat in match.group(2).split(',') if cat.strip()]
            price = match.group(3).strip().strip("'") if match.group(3) != "null" else None
            discount = match.group(4).strip().strip("'") if match.group(4) != "null" else None

            # Convert price and discount to MongoDB query format
            price_filter = parse_price_or_discount(price)
            discount_filter = parse_price_or_discount(discount)

            return product_names, categories, price_filter, discount_filter
    except Exception as e:
        print(f"Error parsing name field: {e}")
    
    return [], [], None, None

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
async def fetch_products(product_names, categories, price_filter, discount_filter):
    query = {"available": True}  # Fetch only available products

    if product_names:
        query["name"] = {"$in": product_names}  # Match any product name in the list
    
    if categories:
        query["category"] = {"$in": categories}  # Match any category in the list
    
    if price_filter:
        query["price"] = price_filter
    
    if discount_filter:
        query["discount"] = discount_filter

    print("MongoDB Query:", query)
    
    try:
        products_cursor = collection.find(query, {"_id": 0})
        return await products_cursor.to_list(length=50)  # Fetch up to 50 results
    except Exception as e:
        print(f"MongoDB Error: {e}")
        return []

# FastAPI route
@app.post("/chat")
async def chatbot(request: QueryRequest):
    try:
        # Get chatbot response
        result = chain.invoke({"input": request.query})
        
        # Ensure result is extracted properly
        if hasattr(result, 'content'):
            result = result.content
        
        print("Chatbot Response:", result)

        response_data = json.loads(result)

        # Parse the "name" field
        product_names, categories, price_filter, discount_filter = parse_name_field(response_data["name"])

        if not product_names and not categories:
            return {"message": response_data["message"]}

        # Fetch products from MongoDB
        filtered_results = await fetch_products(product_names, categories, price_filter, discount_filter)

        return {"message": response_data["message"], "all_filtered_results": filtered_results}

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid response format from chatbot")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
