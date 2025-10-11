from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import google.generativeai as genai

# Configure Gemini with API key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY env var")
genai.configure(api_key=GEMINI_API_KEY)

# Choose a fast, capable model
MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")

app = FastAPI(title="Advisor Agent API (Gemini)")

class ChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None

@app.get("/")
def root():
    return {"ok": True, "model": MODEL_NAME, "message": "API is live (Gemini)"}

@app.post("/chat")
def chat(in_: ChatIn):
    model = genai.GenerativeModel(MODEL_NAME)
    # Basic system guidance for financial-advisor context
    system_preamble = (
        "You are an AI assistant for financial advisors. "
        "Answer clearly and concisely. If uncertain, say so."
    )
    prompt = f"{system_preamble}\n\nUser: {in_.message}\nAssistant:"
    resp = model.generate_content(prompt)
    reply = resp.text if hasattr(resp, "text") else str(resp)
    return {"reply": reply}
