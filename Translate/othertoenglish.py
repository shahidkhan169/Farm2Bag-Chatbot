from fastapi import FastAPI
from pydantic import BaseModel
from googletrans import Translator

# Initialize FastAPI app
app = FastAPI()

# Initialize Translator
translator = Translator()

# Define a request model
class TranslationRequest(BaseModel):
    text: str  # User input text in Tamil, Hindi, Telugu, etc.

def translate_to_english(text: str) -> str:
    """Translates input from any language (Tamil, Hindi, Telugu) to English."""
    try:
        translated = translator.translate(text, src="auto", dest="en")
        return translated.text
    except Exception as e:
        return f"Translation Error: {e}"

@app.post("/translate")
def translate_text(request: TranslationRequest):
    """API Endpoint to translate text to English using POST"""
    translated_text = translate_to_english(request.text)
    return {"original_text": request.text, "translated_text": translated_text}
