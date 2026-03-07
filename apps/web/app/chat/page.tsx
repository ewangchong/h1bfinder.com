'use client';

import { useMemo, useState } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hi! I am your H1B data assistant. Ask me about sponsor trends, approvals, salary benchmarks, or company/title patterns.',
    },
  ]);
  const [input, setInput] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function onSend() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: 'user' as const, text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          year: year ? Number(year) : undefined,
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || 'Chat request failed');
      }

      const answer = payload?.data?.answer;
      if (!answer) throw new Error('Empty answer from assistant');

      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
      <h1 style={{ marginBottom: 8 }}>H1B AI Chatbot</h1>
      <p style={{ marginTop: 0, color: '#52525b' }}>
        Ask questions in English. The bot answers using H1B dataset-backed context (RAG).
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <label htmlFor="year" style={{ fontSize: 13, color: '#666' }}>Fiscal Year (optional):</label>
        <input
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
          placeholder="e.g. 2025"
          style={{ width: 120, border: '1px solid #ddd', borderRadius: 8, padding: '8px 10px' }}
        />
      </div>

      <div style={{ border: '1px solid #eee', borderRadius: 12, background: '#fff', minHeight: 420, padding: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((m, idx) => (
            <div
              key={`${idx}-${m.role}`}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: m.role === 'user' ? '#4f46e5' : '#f4f4f5',
                color: m.role === 'user' ? '#fff' : '#111',
                borderRadius: 12,
                padding: '10px 12px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.45,
              }}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div style={{ color: '#666', fontSize: 13 }}>Thinking…</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about H1B sponsor data..."
          rows={3}
          style={{ flex: 1, border: '1px solid #ddd', borderRadius: 10, padding: 10, resize: 'vertical' }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              void onSend();
            }
          }}
        />
        <button
          type="button"
          disabled={!canSend}
          onClick={() => void onSend()}
          style={{
            minWidth: 110,
            border: 'none',
            borderRadius: 10,
            background: canSend ? '#4f46e5' : '#a5b4fc',
            color: '#fff',
            fontWeight: 700,
            cursor: canSend ? 'pointer' : 'not-allowed',
          }}
        >
          Send
        </button>
      </div>

      <div style={{ marginTop: 8, color: '#71717a', fontSize: 12 }}>
        Tip: press Ctrl/Cmd + Enter to send.
      </div>

      {error && (
        <div style={{ marginTop: 10, color: '#b91c1c', fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  );
}
