from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import transformers
from transformers import AutoTokenizer, AutoModelForCausalLM
import ngrok
import uvicorn

# Initialize FastAPI app
app = FastAPI()

# Load the LLaMA model and tokenizer
model = "/kaggle/input/llama-3.2/transformers/3b-instruct/1"
tokenizer = AutoTokenizer.from_pretrained(model)
pipeline = transformers.pipeline(
    "text-generation",
    model=model,
    torch_dtype=torch.float16,
    device_map="auto"
)

# Set up ngrok
ngrok_auth_token = "2lBvQQTBJSwgRw2dTqZ1F9vqCAG_4TWPvfo4pzRK4AHkF5tpS"
if not ngrok_auth_token:
    raise ValueError("NGROK_AUTH_TOKEN is not set")

ngrok.set_auth_token(ngrok_auth_token)
public_url = ngrok.connect(8000, domain="bream-dear-physically.ngrok-free.app")  # This will give you the ngrok public URL
print(f"FastAPI is live at: {public_url}")

# System message for LLaMA
system_message = (
    "You are a highly specialized AI assistant designed to process natural language queries and convert them into MongoDB queries."
    " The fields in the 'products' collection include 'product_name', 'stock', 'price', and 'category'."
    " Your goal is to translate user inputs into MongoDB queries to retrieve relevant information."
)

def query_model(prompt, temperature=0.7, max_length=1024):
    sequences = pipeline(
        prompt,
        do_sample=True,
        top_p=0.9,
        temperature=temperature,
        max_new_tokens=max_length,
        return_full_text=False,
        pad_token_id=pipeline.model.config.pad_token_id
    )
    return sequences[0]['generated_text']

@app.post('/query')
async def process_query(query_text: str):
    try:
        # Prepare query for LLaMA model
        query = f"{system_message}\nUser's query: {query_text}"

        # Generate MongoDB query using LLaMA model
        mongo_query = query_model(query)

        # Return the generated query as a response (no actual database query)
        return JSONResponse(status_code=200, content={"query": mongo_query})
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
