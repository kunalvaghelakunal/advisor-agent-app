import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Msg = { role: 'user' | 'assistant'; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage() {
    if (!input.trim()) return;
    setLoading(true); setError(null);
    const userMsg: Msg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const assistantMsg: Msg = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="h1">Advisor Agent (Gemini)</div>
        <div className="small">Connected to backend at <code>{API_URL}</code></div>
        <div style={{height: 360, overflowY: 'auto', marginTop: 12, paddingRight: 6}}>
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'messageUser' : 'messageAssistant'}>
              <strong>{m.role}:</strong> {m.content}
            </div>
          ))}
        </div>
        <div className="inputRow">
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            onKeyDown={(e)=>{ if(e.key==='Enter') sendMessage(); }}
          />
          <button className="button" onClick={sendMessage} disabled={loading}>
            {loading ? '...' : 'Send'}
          </button>
        </div>
        {error && <div style={{color: 'crimson', marginTop: 8}}>{error}</div>}
      </div>
    </div>
  );
}
