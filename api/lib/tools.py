# Tool stubs - expand to add Gmail/Calendar/HubSpot actions.
# Keep interface simple and stateless for demo purposes.

def send_email(to: str, subject: str, body: str) -> dict:
    # TODO: integrate with Gmail API once OAuth is added
    return {"status": "stubbed", "to": to, "subject": subject}
