'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

type ChatStatus = {
  enabled: boolean;
  model?: string;
  rate_limit_per_min?: number;
};

type ChatClientProps = {
  mode?: 'page' | 'modal';
  onClose?: () => void;
};

const SUGGESTED_QUESTIONS = [
  'Which companies had the most H1B approvals in the latest year?',
  'Which job titles show the highest average salaries?',
  'Compare Amazon and Google for H1B approvals and salary trends.',
  'What changed in H1B sponsor rankings between 2024 and 2025?',
  'Which companies are strongest for software engineer sponsorship?',
] as const;

export default function ChatClient({ mode = 'page', onClose }: ChatClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hi! I am your H1B data assistant. Ask me about sponsor trends, approvals, salary benchmarks, or company-title patterns.',
    },
  ]);
  const [input, setInput] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [chatStatus, setChatStatus] = useState<ChatStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const res = await fetch('/api/v1/chat/status', {
          headers: { Accept: 'application/json' },
        });
        const payload = await res.json();

        if (!res.ok || !payload?.success) {
          throw new Error(payload?.message || 'Failed to load chat status');
        }

        if (!cancelled) {
          setChatStatus(payload.data);
          if (!payload.data?.enabled) {
            setError('Chat is currently disabled on this server. Set GEMINI_API_KEY in the backend environment and restart the backend container.');
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load chat status.');
        }
      } finally {
        if (!cancelled) {
          setStatusLoading(false);
        }
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading && !statusLoading && chatStatus?.enabled === true,
    [chatStatus?.enabled, input, loading, statusLoading]
  );

  async function onSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || loading || chatStatus?.enabled !== true) return;

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
      const message = e?.message || 'Something went wrong.';
      if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota') || message.includes('billing')) {
        setError(`Gemini API is configured but unavailable: ${message}`);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  const isModal = mode === 'modal';

  return (
    <div style={{ maxWidth: isModal ? 'none' : 1080, margin: '0 auto', paddingBottom: isModal ? 0 : 80 }}>
      
      {/* 1. Page Header / Hero (only for page mode) */}
      {!isModal && (
        <div style={{ textAlign: 'center', padding: '64px 20px 48px' }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#4f46e5",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              background: "#eef2ff",
              padding: "6px 14px",
              borderRadius: 999,
            }}>
              Assistant
            </span>
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: "clamp(32px, 5vw, 48px)", 
            letterSpacing: "-0.04em",
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.1
          }}>
            H1B Intelligence Chat
          </h1>
          <p style={{
            margin: '18px auto 0',
            maxWidth: 640,
            color: '#475569',
            lineHeight: 1.7,
            fontSize: 'clamp(15px, 2vw, 17px)',
            fontWeight: 500
          }}>
            Ask deep-dive questions about verified sponsor trends and salary benchmarks. Our AI analyzes historical filings to provide contextual answers.
          </p>

          <div style={{ marginTop: 32 }}>
            <Link href="/blog" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "#f8fafc",
              color: "#475569",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              border: "1px solid #e2e8f0",
              transition: "all 0.2s"
            }}>
              <span>Looking for deep dives? Read our Blog</span>
              <span style={{ color: "#94a3b8" }}>→</span>
            </Link>
          </div>
        </div>
      )}

      <div style={{ padding: isModal ? '24px' : '0 20px' }}>
        
        {/* 2. Product Utility / Chat Controls */}
        <div style={{ 
          maxWidth: 900, 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: 16,
            paddingBottom: 16,
            borderBottom: '1px solid #f1f5f9'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
                {statusLoading ? (
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Checking Brain...</span>
                ) : chatStatus?.enabled ? (
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: '#10b981' }} />
                    {chatStatus.model?.split('/').pop() || 'Online'}
                  </span>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Offline</span>
                )}
             </div>

             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fiscal Focus</label>
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="e.g. 2025"
                  style={{
                    width: 80,
                    padding: '8px 12px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    fontWeight: 600,
                    outline: 'none',
                    background: '#f8fafc'
                  }}
                />
             </div>
          </div>

          {/* 3. Main Content Area / Chat Interface */}
          <div style={{ 
            display: 'grid', 
            gap: 20,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 24,
            padding: '24px',
            boxShadow: '0 4px 20px -10px rgba(0,0,0,0.02)'
          }}>
            
            <div className="chat-suggestions" style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => void onSend(question)}
                    disabled={loading || statusLoading || chatStatus?.enabled !== true}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ 
                minHeight: 480, 
                maxHeight: 600, 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                padding: '20px',
                borderRadius: 20,
                background: '#f8fafc',
                border: '1px solid #f1f5f9'
              }}>
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '14px 18px',
                      borderRadius: 20,
                      fontSize: 15,
                      lineHeight: 1.6,
                      background: m.role === 'user' ? '#0f172a' : '#fff',
                      color: m.role === 'user' ? '#fff' : '#0f172a',
                      border: m.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                      boxShadow: m.role === 'assistant' ? '0 1px 2px rgba(0,0,0,0.02)' : 'none'
                    }}
                  >
                    {m.text}
                  </div>
                ))}
                {loading && <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, fontStyle: 'italic' }}>Analyzing Brain datasets...</div>}
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={chatStatus?.enabled === false ? 'Brain is offline.' : 'Ask about H1B sponsor trends...'}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: 20,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  fontSize: 15,
                  outline: 'none',
                  resize: 'none',
                  minHeight: 60
                }}
                disabled={chatStatus?.enabled === false || statusLoading}
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
                  background: '#0f172a',
                  color: '#fff',
                  height: 60,
                  padding: '0 24px',
                  borderRadius: 20,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  opacity: canSend ? 1 : 0.6,
                  transition: 'opacity 0.2s'
                }}
              >
                Send
              </button>
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>{error}</div>}
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                Tip: Use Cmd/Ctrl + Enter to send fast.
            </div>
          </div>
        </div>

        {/* Footer Disclaimer Strip */}
        <div style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, maxWidth: 800, margin: '0 auto' }}>
             Responses are generated by an AI assistant using historical H1B disclosure data as context. AI can make mistakes. Always verify critical filing requirements with official Department of Labor resources.
          </p>
        </div>
      </div>

    </div>
  );
}
