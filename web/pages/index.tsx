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
    setLoading(true);
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();
      const aiMsg = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
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
