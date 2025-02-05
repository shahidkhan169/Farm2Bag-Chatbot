from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import transformers
from transformers import AutoTokenizer, AutoModelForCausalLM
import uvicorn
import torch
import pymongo
import ngrok

# Initialize FastAPI app
app = FastAPI()

# Load the LLaMA model and tokenizer
model_path = "/kaggle/input/llama-3.2/transformers/3b-instruct/1"
tokenizer = AutoTokenizer.from_pretrained(model_path)
pipeline = transformers.pipeline(
    "text-generation",
    model=model_path,
    torch_dtype=torch.float16,
    device_map="auto"
)

# Connect to MongoDB
MONGO_URI = "mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?retryWrites=true&w=majority"
client = pymongo.MongoClient(MONGO_URI)
db = client["your_database"]
collection = db["products"]

# Set up ngrok
ngrok_auth_token = "2lBvQQTBJSwgRw2dTqZ1F9vqCAG_4TWPvfo4pzRK4AHkF5tpS"
ngrok.set_auth_token(ngrok_auth_token)
listener = ngrok.forward("127.0.0.1:8000")

# System Message to guide AI for MongoDB query generation
system_message = (
    "You are an AI that translates natural language queries into MongoDB queries. "
    "Provide only the MongoDB query in JSON format without any explanation or additional text."
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

@app.post('/query')
async def process_query(request: Request):
    try:
        # Parse request body
        body = await request.json()
        query_text = body.get("query")

        if not query_text:
            raise HTTPException(status_code=400, detail="Query field is required")

        # Prepare prompt for LLaMA model
        query = f"{system_message}\nUser's query: {query_text}\nMongoDB Query:"

        # Generate MongoDB query
        mongo_query_text = query_model(query)

        # Convert to dictionary
        try:
            mongo_query = eval(mongo_query_text)  # Convert string to dictionary
            if not isinstance(mongo_query, dict):
                raise ValueError("Invalid MongoDB query format")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Invalid MongoDB query format: {e}")

        # Execute MongoDB query
        results = list(collection.find(mongo_query, {"_id": 0}))  # Exclude _id field

        return JSONResponse(status_code=200, content={"results": results})
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
