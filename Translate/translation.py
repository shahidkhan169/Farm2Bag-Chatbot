from fastapi import FastAPI
from pydantic import BaseModel
from googletrans import Translator

# Initialize FastAPI app
app = FastAPI()

# Initialize Translator
translator = Translator()

# Define a request model
class ReverseTranslationRequest(BaseModel):
    text: str  # Input text in English
    target_language: str  # Target language (tam, tel, hin)

# Define a function to perform translation
def translate_from_english(text: str, target_lang: str) -> str:
    """Translates input from English to Tamil, Telugu, or Hindi."""
    
    # Mapping user-friendly language codes to Google Translate language codes
    language_map = {
        "tamil": "ta",  # Tamil
        "telugu": "te",  # Telugu
        "hindi": "hi"   # Hindi
    }
    
    if target_lang not in language_map:
        return "Invalid target language! Please use 'tamil' for Tamil, 'telugu' for Telugu, or 'hindi' for Hindi."
    
    try:
        translated = translator.translate(text, src="en", dest=language_map[target_lang])
        return translated.text
    except Exception as e:
        return f"Translation Error: {e}"

@app.post("/reverse_translate")
def reverse_translate_text(request: ReverseTranslationRequest):
    """API Endpoint to translate English text to Tamil, Telugu, or Hindi using POST"""
    translated_text = translate_from_english(request.text, request.target_language)
    return {
        "original_text": request.text,
        "target_language": request.target_language,
        "translated_text": translated_text
    }
