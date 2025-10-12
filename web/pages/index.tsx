import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hubspotConnected, setHubspotConnected] = useState(false);

  async function sendMessage() {
  if (!input.trim()) return;
  const text = input.trim();
  setLoading(true);
  const userMsg = { role: "user", content: text };
  setMessages((prev) => [...prev, userMsg]);
  setInput("");

  try {
    // 🧠 Get Google access token from NextAuth session
    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    const token =
      sessionData?.token?.access_token ||
      sessionData?.accessToken ||
      sessionData?.user?.accessToken;

    // 🕒 If user asks about meetings/calendar
    if (/meeting|calendar|schedule/i.test(text)) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/google/calendar/events`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ ${data.error}` },
        ]);
      } else if (data.events?.length) {
        const formatted = data.events
          .map(
            (e: any) =>
              `📅 ${e.summary || "No title"} — ${e.start} → ${e.end}`
          )
          .join("\n");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Here are your upcoming meetings:\n\n${formatted}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "No upcoming meetings found in Google Calendar.",
          },
        ]);
      }
    } else {
      // 💬 Regular chat flow
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    }
  } catch (err) {
    console.error("Chat error:", err);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "⚠️ Error contacting server." },
    ]);
  }
  setLoading(false);
}



  async function connectHubspot() {
    window.location.href = `${API_URL}/oauth/hubspot/initiate`;
  }

  return (
    <div className="app-container">
      <header className="chat-header">
        <div className="header-left">
          <h1>Advisor Agent</h1>
        </div>
        <div className="header-right">
          {!session ? (
            <button className="btn" onClick={() => signIn("google")}>
              🔐 Sign in with Google
            </button>
          ) : (
            <>
              <span className="welcome">Hello, {session.user?.name?.split(" ")[0]}</span>
              <button className="btn" onClick={() => signOut()}>
                ⎋ Sign out
              </button>
              <button
                className={`btn ${hubspotConnected ? "connected" : ""}`}
                onClick={connectHubspot}
              >
                🔗 {hubspotConnected ? "HubSpot Connected" : "Connect HubSpot"}
              </button>
            </>
          )}
        </div>
      </header>

      <main className="chat-window">
        {messages.length === 0 && (
          <div className="placeholder">
            <p>💬 Ask me anything about your clients, meetings, or HubSpot data.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "chat-bubble user" : "chat-bubble bot"}>
            {m.content}
          </div>
        ))}
        {loading && <div className="typing">The agent is thinking...</div>}
      </main>

      <footer className="input-area">
        <input
          type="text"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={!session}
        />
        <button onClick={sendMessage} disabled={loading || !session}>
          Send
        </button>
      </footer>
    </div>
  );
}
