from fastapi import FastAPI, Request, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os, json
import google.generativeai as genai

from lib.db import init_db, get_session, DBSessionDep
from lib.tools import TOOL_SCHEMAS, ToolExecutor

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
model = genai.GenerativeModel(MODEL_NAME, tools=TOOL_SCHEMAS)

app = FastAPI(title="Advisor Agent API (Gemini, Full)")

class ChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"ok": True, "model": MODEL_NAME, "message": "API is live (Gemini Full)"}

@app.post("/chat")
def chat(in_: ChatIn, db: DBSessionDep = Depends(get_session)):
    system = "You are an AI assistant for financial advisors. Use tools when appropriate."
    prompt = [
        {"role": "user", "parts": [f"{system}\nUser: {in_.message}"]}
    ]
    resp = model.generate_content(prompt)
    # Handle potential function calls (tool calls)
    executor = ToolExecutor(db)
    # google-generativeai returns function call parts under resp.candidates[].content.parts
    tool_results = []
    try:
        for cand in resp.candidates or []:
            for part in cand.content.parts or []:
                fc = getattr(part, "function_call", None)
                if fc and fc.name:
                    args = {k: v for k, v in (fc.args or {}).items()}
                    result = executor.execute(fc.name, args)
                    tool_results.append({"name": fc.name, "args": args, "result": result})
        text = resp.text if hasattr(resp, "text") else str(resp)
    except Exception as e:
        text = getattr(resp, "text", "") or "I had trouble interpreting tool calls."
    return {"reply": text, "tool_results": tool_results}

# --- HubSpot OAuth stubs ---
@app.get("/oauth/hubspot/initiate")
def hubspot_initiate():
    client_id = os.getenv("HUBSPOT_CLIENT_ID", "YOUR_HUBSPOT_CLIENT_ID")
    redirect_uri = os.getenv("HUBSPOT_REDIRECT_URI", "http://localhost:8000/oauth/hubspot/callback")
    scopes = os.getenv("HUBSPOT_SCOPES", "crm.objects.contacts.read crm.objects.contacts.write crm.objects.notes.read crm.objects.notes.write")
    url = (
        "https://app.hubspot.com/oauth/authorize"
        f"?client_id={client_id}&redirect_uri={redirect_uri}&scope={scopes}&response_type=code"
    )
    return {"authorize_url": url}

@app.get("/oauth/hubspot/callback")
def hubspot_callback(code: str):
    # Exchange code for token (stubbed)
    # In production, POST to https://api.hubapi.com/oauth/v1/token
    return {"status": "ok", "code": code, "note": "Exchange this code for tokens server-side."}
