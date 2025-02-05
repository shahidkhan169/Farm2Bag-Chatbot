from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import transformers
import torch
import pymongo
import ngrok
import json
import re

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

# Set up ngrok
ngrok_auth_token = "2lBvQQTBJSwgRw2dTqZ1F9vqCAG_4TWPvfo4pzRK4AHkF5tpS"
if not ngrok_auth_token:
    raise ValueError("NGROK_AUTH_TOKEN is not set")
ngrok.set_auth_token(ngrok_auth_token)
listener = ngrok.forward("127.0.0.1:8000", authtoken_from_env=True, domain="bream-dear-physically.ngrok-free.app")

# System Message to guide AI for MongoDB query generation and normal chatbot behavior
system_message = (
    "You are an AI that translates natural language into valid MongoDB queries when the user asks about the products in the database. "
    "If the user asks for something unrelated to the products, behave like a chatbot answer friendly like conversation."
    "The 'products' collection contains the following fields with their respective data types and constraints: "
    "'name': string (required), "
    "'category': string (required, one of 'Fruits', 'Vegetables', 'Rice', 'Pulses', 'Spices', 'Dairy', 'Juices', 'Combos'), "
    "'price': number (required), "
    "'weight': number (required), "
    "'unit': string (required), "
    "'available': boolean (default: true), "
    "'rating': number (min: 1, max: 5, default: 0), "
    "'discount': number (default: 0). "
    "Example: If asked to find all spices, generate: "
    "{ 'category': 'Spices' }. "
    "If asked to find spices with a price below 50, generate: "
    "{ 'category': 'Spices', 'price': { '$lt': 50 } }. "
    "Ensure the JSON is formatted correctly with proper MongoDB operators. "
)

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
    return sequences[0]['generated_text'].strip().split("\n")[0]  # Extracting only the first response

# Helper function to check if the query is MongoDB-related (simple keyword check)
def is_mongodb_query(query_text):
    # You can expand this regex or logic to improve query detection
    return bool(re.search(r"(spices|fruits|vegetables|rice|pulses|dairy|juices|combos)", query_text, re.IGNORECASE))

@app.get("/test-db")
async def test_db():
    try:
        client.admin.command('ping')
        results = list(collection.find({ "available": True }, {"_id": 0}))
        return {"results": results}
    except Exception as e:
        return {"error": str(e)}

@app.post('/query')
async def process_query(request: Request):
    try:
        # Parse request body
        body = await request.json()
        query_text = body.get("query")

        if not query_text:
            raise HTTPException(status_code=400, detail="Query field is required")

        if is_mongodb_query(query_text):  # Check if it's a MongoDB query
            # Prepare prompt for LLaMA model to generate MongoDB query
            query = f"{system_message}\nUser's query: {query_text}\nMongoDB Query in JSON format:"

            # Generate MongoDB query
            mongo_query_text = query_model(query)
            print("Raw LLaMA Output:", mongo_query_text)  # Debugging line

            # Ensure the generated output is valid JSON
            try:
                mongo_query = json.loads(mongo_query_text)  # Convert to dictionary safely
                if not isinstance(mongo_query, dict):
                    raise ValueError("Generated query is not a valid JSON object")
            except json.JSONDecodeError:
                raise HTTPException(status_code=500, detail="Invalid MongoDB query format (not JSON)")

            # Execute MongoDB query
            results = list(collection.find(mongo_query, {"_id": 0}))  # Exclude _id field

            # Return the MongoDB query
            return JSONResponse(status_code=200, content={"generated_query": mongo_query_text, "results": results})

        else:
            # If it's not a MongoDB query, treat it as a normal chatbot query for eCommerce
            ecommerce_prompt = (
                "You are a friendly assistant for an eCommerce site called 'Farm2Bag'. "
                "You help users make recommendations, and answer casual questions. "
                "Always respond in a friendly and engaging manner, as if you're chatting with a friend."
                "Talk short and sweet with like attractive"
            )

            # Prepare the prompt for LLaMA model to engage in a friendly eCommerce chatbot conversation
            conversation_response = query_model(f"{ecommerce_prompt}\nUser's query: {query_text}\nYour response:")

            # Return the friendly response
            return JSONResponse(status_code=200, content={"response": conversation_response})

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
