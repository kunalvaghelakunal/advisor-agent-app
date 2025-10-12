import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();
      const aiMsg = { role: "assistant", content: data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "⚠️ Error contacting server." },
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="app-container">
      <header className="chat-header">
        <h1>Advisor Agent</h1>
      </header>

      <main className="chat-window">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "chat-bubble user" : "chat-bubble bot"}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="typing">The agent is thinking...</div>}
      </main>

      <footer className="input-area">
        <input
          type="text"
          placeholder="Ask the agent..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </footer>
    </div>
  );
}
