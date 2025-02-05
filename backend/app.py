from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import transformers
from transformers import AutoTokenizer, AutoModelForCausalLM
import uvicorn
import torch
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

# Set up ngrok
ngrok_auth_token = "2lBvQQTBJSwgRw2dTqZ1F9vqCAG_4TWPvfo4pzRK4AHkF5tpS"
if not ngrok_auth_token:
    raise ValueError("NGROK_AUTH_TOKEN is not set")

ngrok.set_auth_token(ngrok_auth_token)
listener = ngrok.forward("127.0.0.1:8000", authtoken_from_env=True, domain="bream-dear-physically.ngrok-free.app")

# Simplified System Message for precise MongoDB query generation
system_message = (
     "You are an AI that translates natural language into valid MongoDB queries. "
    "Ensure that the output is strictly a valid **JSON object** and avoid any extra text."
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
    # Extract only the query from the response
    return sequences[0]['generated_text'].strip().split("\n")[0]

@app.post('/query')
async def process_query(request: Request):
    try:
        # Parse raw JSON body
        body = await request.json()
        query_text = body.get("query")

        if not query_text:
            raise HTTPException(status_code=400, detail="Query field is required")

        # Prepare query for LLaMA model
        query = f"{system_message}\nUser's query: {query_text}\nMongoDB Query:"

        # Generate MongoDB query using LLaMA model
        mongo_query = query_model(query)

        # Return only the MongoDB query
        return JSONResponse(status_code=200, content={"query": mongo_query})
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
