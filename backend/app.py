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

ngrok_auth_token = "2lBvQQTBJSwgRw2dTqZ1F9vqCAG_4TWPvfo4pzRK4AHkF5tpS"
if not ngrok_auth_token:
    raise ValueError("NGROK_AUTH_TOKEN is not set")

ngrok.set_auth_token(ngrok_auth_token)
listener = ngrok.forward("127.0.0.1:8000", authtoken_from_env=True, domain="bream-dear-physically.ngrok-free.app")

# System Prompt for MongoDB Query Generation
system_message = """
You are an AI that translates natural language into valid MongoDB queries. 
The 'products' collection contains:
- 'name': string
- 'category': string ('Fruits', 'Vegetables', 'Rice', 'Pulses', 'Spices', 'Dairy', 'Juices', 'Combos')
- 'price': number
- 'weight': number
- 'unit': string
- 'available': boolean (default: true)
- 'rating': number (1-5)
- 'discount': number (default: 0)

Always include { "available": true } in the generated MongoDB query.
Example:
- Query: "Find all spices under 50"
- Output: { "category": "Spices", "price": { "$lt": 50 }, "available": true }
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
    return sequences[0]['generated_text'].strip().split("\n")[0]  # Extract the first response

# Function to check if user query is related to MongoDB
def is_mongodb_query(query_text):
    keywords = ["spices", "fruits", "vegetables", "rice", "pulses", "dairy", "juices", "combos",
                "price", "rating", "discount", "below", "above", "less than", "greater than", "products"]
    return any(keyword in query_text.lower() for keyword in keywords)

# Function to format and validate the generated MongoDB query
def generate_mongo_query(query_text):
    if query_text.strip().lower() == "products":
        return {"available": True}  # Return all available products
    
    query_prompt = f"{system_message}\nUser Query: {query_text}\nMongoDB Query (JSON):"
    raw_query = query_model(query_prompt)
    print("LLaMA Generated:", raw_query)  # Debugging Output

    try:
        query_dict = json.loads(raw_query)
        if not isinstance(query_dict, dict):
            raise ValueError("Invalid MongoDB query format")

        # Ensure 'available' field is always true
        query_dict["available"] = True
        return query_dict
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI generated an invalid query format")

@app.post('/query')
async def process_query(request: Request):
    try:
        body = await request.json()
        query_text = body.get("query")

        if not query_text:
            raise HTTPException(status_code=400, detail="Query field is required")

        if is_mongodb_query(query_text):
            mongo_query = generate_mongo_query(query_text)
            results = list(collection.find(mongo_query, {"_id": 0}))  # Fetch products
            return JSONResponse(status_code=200, content={"generated_query": mongo_query, "results": results})
        else:
            chat_response = query_model(query_text)  # Normal chatbot response
            return JSONResponse(status_code=200, content={"response": chat_response})

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
