from typing import Dict, Any
from sqlalchemy.orm import Session

# Define tool schemas for Gemini function calling
TOOL_SCHEMAS = [
    {
        "function_declarations": [
            {
              "name": "send_email",
              "description": "Send an email via Gmail",
              "parameters": {
                "type": "OBJECT",
                "properties": {
                  "to": {"type": "STRING"},
                  "subject": {"type": "STRING"},
                  "body": {"type": "STRING"}
                },
                "required": ["to","subject","body"]
              }
            },
            {
              "name": "find_available_times",
              "description": "Find available times in Google Calendar",
              "parameters": {
                "type": "OBJECT",
                "properties": {
                  "attendees": {"type": "ARRAY", "items": {"type":"STRING"}},
                  "duration_min": {"type": "NUMBER"}
                },
                "required": ["attendees","duration_min"]
              }
            },
            {
              "name": "create_calendar_event",
              "description": "Create a calendar event",
              "parameters": {
                "type": "OBJECT",
                "properties": {
                  "title": {"type": "STRING"},
                  "start_iso": {"type": "STRING"},
                  "end_iso": {"type": "STRING"},
                  "attendees": {"type": "ARRAY", "items": {"type":"STRING"}}
                },
                "required": ["title","start_iso","end_iso"]
              }
            },
            {
              "name": "hubspot_lookup",
              "description": "Lookup a contact in HubSpot by name or email",
              "parameters": {
                "type": "OBJECT",
                "properties": {
                  "query": {"type": "STRING"}
                },
                "required": ["query"]
              }
            },
            {
              "name": "hubspot_upsert",
              "description": "Upsert a HubSpot contact by email",
              "parameters": {
                "type": "OBJECT",
                "properties": {
                  "email": {"type": "STRING"},
                  "properties": {"type": "OBJECT"}
                },
                "required": ["email"]
              }
            },
            {
              "name": "hubspot_add_note",
              "description": "Add a note to a HubSpot contact",
              "parameters": {
                "type": "OBJECT",
                "properties": {
                  "contact_id": {"type": "STRING"},
                  "text": {"type": "STRING"}
                },
                "required": ["contact_id","text"]
              }
            }
        ]
    }
]

class ToolExecutor:
    def __init__(self, db: Session):
        self.db = db

    def execute(self, name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        # Stub implementations; replace with real API calls.
        if name == "send_email":
            return {"status":"sent_stub", "args": args}
        if name == "find_available_times":
            return {"time_slots":[{"start":"2025-10-14T14:00:00Z","end":"2025-10-14T14:30:00Z"}]}
        if name == "create_calendar_event":
            return {"event_id":"evt_stub_123", "args": args}
        if name == "hubspot_lookup":
            return {"contacts":[{"id":"123","email":"sara@example.com","properties":{"firstname":"Sara","lastname":"Smith"}}]}
        if name == "hubspot_upsert":
            return {"id":"contact_stub_456","email":args.get("email")}
        if name == "hubspot_add_note":
            return {"note_id":"note_stub_789"}
        return {"error":"unknown_tool","name":name,"args":args}
