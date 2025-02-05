from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import transformers
import torch
import pymongo
import json
import re
import ngrok

# Initialize FastAPI app
app = FastAPI()

# Load the LLaMA model and tokenizer
model_path = "/kaggle/input/llama-3.2/transformers/3b-instruct/1"
pipeline = transformers.pipeline(
    "text-generation",
    model=model_path,
    torch_dtype=torch.float16,
    device_map="auto"
)

# Connect to MongoDB
MONGO_URI = "mongodb+srv://shahid1692004:dihahs169@farm2bag-db.sslpa.mongodb.net/?retryWrites=true&w=majority&appName=Farm2Bag-DB"
client = pymongo.MongoClient(MONGO_URI)
db = client["test"]
collection = db["products"]

# Ngrok setup
ngrok_auth_token = "2lBvQQTBJSwgRw2dTqZ1F9vqCAG_4TWPvfo4pzRK4AHkF5tpS"
if not ngrok_auth_token:
    raise ValueError("NGROK_AUTH_TOKEN is not set")

ngrok.set_auth_token(ngrok_auth_token)
listener = ngrok.forward("127.0.0.1:8000", authtoken_from_env=True, domain="bream-dear-physically.ngrok-free.app")

# System Prompt
system_message = """
You are an AI assistant for Farm2Bag, an online grocery store. You can:
1. Answer general queries in short and sweet(e.g., "What is Farm2Bag?", "Tell me a joke").
2. Translate product-related requests into MongoDB queries.

The 'products' collection contains:
- 'name': string
- 'category': string ('Fruits', 'Vegetables', 'Rice', 'Pulses', 'Spices', 'Dairy', 'Juices', 'Combos')
- 'price': number
- 'weight': number
- 'unit': string
- 'available': boolean (default: true)
- 'rating': number (1-5)
- 'discount': number (default: 0)

Always include { "available": true } in MongoDB queries.

Example Queries:
- User: "Find all dairy products under 100"
  AI: { "category": "Dairy", "price": { "$lt": 100 }, "available": true }
- User: "What is Farm2Bag?"
  AI: "Farm2Bag is an online grocery store that provides fresh products delivered to your doorstep!"
"""

# Function to query LLaMA model
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
    return sequences[0]['generated_text'].strip()

# Function to check if user query is related to MongoDB
def is_mongodb_query(query_text):
    keywords = ["spices", "fruits", "vegetables", "rice", "pulses", "dairy", "juices", "combos",
                "price", "rating", "discount", "below", "above", "less than", "greater than", "find", "show"]
    return any(keyword in query_text.lower() for keyword in keywords)

# Function to format and validate the generated MongoDB query
def generate_mongo_query(query_text):
    query_prompt = f"{system_message}\nUser Query: {query_text}\nMongoDB Query (JSON):"
    raw_query = query_model(query_prompt)

    try:
        query_dict = json.loads(raw_query)
        if not isinstance(query_dict, dict):
            raise ValueError("Invalid MongoDB query format")

        # Ensure 'available' field is always true
        query_dict["available"] = True
        return query_dict
    except json.JSONDecodeError:
        return None  # Return None if the query is not valid JSON

@app.post('/query')
async def process_query(request: Request):
    try:
        body = await request.json()
        query_text = body.get("query")

        if not query_text:
            raise HTTPException(status_code=400, detail="Query field is required")

        if is_mongodb_query(query_text):
            mongo_query = generate_mongo_query(query_text)
            if mongo_query:  # Ensure valid MongoDB query
                results = list(collection.find(mongo_query, {"_id": 0}))  # Fetch products
                return JSONResponse(status_code=200, content={"generated_query": mongo_query, "response": "Here are the products you've been looking for 🛒:", "results": results})

        # Handle general chatbot queries
        chatbot_prompt = f"{system_message}\nUser Query: {query_text}\nAI Response:"
        chat_response = query_model(chatbot_prompt)
        return JSONResponse(status_code=200, content={"response": chat_response})

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
