from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import transformers
import torch
import pymongo
import json
import re
import ngrok

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (replace with your frontend URL in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the LLaMA model
model_path = "/kaggle/input/llama-3.2/transformers/3b-instruct/1"
pipeline = transformers.pipeline(
    "text-generation",
    model=model_path,
    torch_dtype=torch.float16,
    device_map="auto"
)

# MongoDB Configuration
MONGO_URI = "mongodb+srv://shahid1692004:dihahs169@farm2bag-db.sslpa.mongodb.net/?retryWrites=true&w=majority&appName=Farm2Bag-DB"
client = pymongo.MongoClient(MONGO_URI)
db = client["test"]
collection = db["products"]

# Ngrok Configuration
ngrok_auth_token = "2lBvQQTBJSwgRw2dTqZ1F9vqCAG_4TWPvfo4pzRK4AHkF5tpS"
if not ngrok_auth_token:
    raise ValueError("NGROK_AUTH_TOKEN is not set")
ngrok.set_auth_token(ngrok_auth_token)
listener = ngrok.forward("127.0.0.1:8000", authtoken_from_env=True, domain="bream-dear-physically.ngrok-free.app")

# System Message
system_message = """
You are an AI assistant for Farm2Bag, an online grocery store. Your tasks are:
1. Engage in natural conversations for general queries (e.g., "Hi", "How are you?", "Tell me a joke").
2. For product-related queries, generate a MongoDB query to fetch relevant products.

Product-related queries include:
- Searching by category: ['Fruits', 'Vegetables', 'Rice', 'Pulses', 'Spices', 'Dairy', 'Juices', 'Combos']
- Searching by product name, price, discount, or rating.

Always include { "available": true } in MongoDB queries.

Example:
- User: "Hi"
  AI: "Hello! How can I assist you today?"
- User: "Find fruits under 50"
  AI: { "category": "Fruits", "price": { "$lt": 50 }, "available": true }
"""

# Function to query the LLaMA model
def query_model(prompt, temperature=0.7, max_length=150):
    sequences = pipeline(
        prompt,
        do_sample=True,
        top_p=0.9,
        temperature=temperature,
        max_new_tokens=max_length,
        return_full_text=False,
        pad_token_id=pipeline.model.config.pad_token_id
    )
    return sequences[0]['generated_text'].strip().split("\n")[0]

# Function to check if a query is product-related
def is_product_query(query_text):
    product_keywords = ["fruits", "vegetables", "rice", "pulses", "spices", "dairy", "juices", "combos",
                        "price", "discount", "rating", "under", "above", "less than", "greater than"]
    return any(keyword in query_text.lower() for keyword in product_keywords)

# Function to generate a MongoDB query
def generate_mongo_query(query_text):
    query_prompt = f"{system_message}\nUser Query: {query_text}\nMongoDB Query (JSON):"
    raw_query = query_model(query_prompt)
    try:
        query_dict = json.loads(raw_query)
        if not isinstance(query_dict, dict):
            raise ValueError("Invalid MongoDB query format")
        query_dict["available"] = True  # Ensure only available products are fetched
        return query_dict
    except json.JSONDecodeError:
        return None

# API Endpoint to handle user queries
@app.post('/query')
async def process_query(request: Request):
    try:
        body = await request.json()
        query_text = body.get("query")
        if not query_text:
            raise HTTPException(status_code=400, detail="Query field is required")

        # Handle general conversation
        if not is_product_query(query_text):
            response = query_model(f"{system_message}\nUser Query: {query_text}\nAI Response:")
            return JSONResponse(status_code=200, content={"response": response})

        # Handle product-related queries
        mongo_query = generate_mongo_query(query_text)
        if not mongo_query:
            return JSONResponse(status_code=400, content={"response": "Could not generate a valid query."})

        results = list(collection.find(mongo_query, {"_id": 0}))
        if not results:
            return JSONResponse(status_code=200, content={"response": "No products found matching your criteria."})

        return JSONResponse(status_code=200, content={
            "response": "Here are the products you've been looking for 🛒:",
            "results": results
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
