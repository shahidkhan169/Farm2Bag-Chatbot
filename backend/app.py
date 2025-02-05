from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import transformers
import torch
import pymongo
import ngrok
import json

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

# System Message to guide AI for MongoDB query generation
system_message = (
    "You are an AI that translates natural language into valid MongoDB queries. "
    "Ensure the output is strictly a **valid JSON object** with no extra text or explanation. "
    "The 'products' collection contains the following fields: "
    "{ 'name': string, 'category': string, 'price': number, 'weight': string, "
    "'unit': string, 'available': boolean, 'rating': number, 'discount': number }. "
    "Example: If asked to find available products below $50, generate: "
    "{ 'available':true, 'price': { '$lt': 50 } }. "
    "Ensure the JSON is formatted correctly with proper MongoDB operators."
)



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

@app.get("/test-db")
async def test_db():
    try:
        client.admin.command('ping')
        results = list(collection.find({ "name": "Turmeric Powder" }, { "price": 1, "available": 1 }))
        
        # Convert ObjectId to string in results
        results = [convert_objectid_to_str(doc) for doc in results]
        
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

        # Prepare prompt for LLaMA model
        query = f"{system_message}\nUser's query: {query_text}\nMongoDB Query in JSON format:"

        # Generate MongoDB query
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

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
