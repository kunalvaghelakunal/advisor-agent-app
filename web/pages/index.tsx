import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Msg = { role: 'user' | 'assistant'; content: string };

export default function Home() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg: Msg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg.content }),
    });
    const data = await res.json();
    const assistantMsg: Msg = { role: 'assistant', content: data.reply };
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
  }

  async function connectHubspot() {
    const res = await fetch(`${API_URL}/oauth/hubspot/initiate`);
    const data = await res.json();
    if (data.authorize_url) window.location.href = data.authorize_url;
  }

  return (
    <div className="container">
      <div className="header">
        <div className="h1">Advisor Agent (Gemini, Full)</div>
        <div>
          {session ? (
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span className="badge">{session.user?.email}</span>
              <button className="button" onClick={()=>signOut()}>Sign out</button>
            </div>
          ) : (
            <button className="button" onClick={()=>signIn('google')}>Sign in with Google</button>
          )}
        </div>
      </div>

      <div className="card" style={{marginBottom:12}}>
        <div className="small">Connected backend: <code>{API_URL}</code></div>
        <div className="row">
          <button className="linkBtn" onClick={connectHubspot}>Connect HubSpot</button>
        </div>
      </div>

      <div className="card">
        <div style={{height: 420, overflowY: 'auto', marginTop: 12, paddingRight: 6}}>
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'messageUser' : 'messageAssistant'}>
              <strong>{m.role}:</strong> {m.content}
            </div>
          ))}
        </div>
        <div className="row">
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the agent..."
            onKeyDown={(e)=>{ if(e.key==='Enter') sendMessage(); }}
          />
          <button className="button" onClick={sendMessage} disabled={loading}>
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
