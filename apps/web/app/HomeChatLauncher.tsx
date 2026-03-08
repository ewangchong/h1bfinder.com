'use client';

import { useEffect, useState } from 'react';
import ChatClient from './chat/ChatClient';

export default function HomeChatLauncher() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function closeLauncher() {
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <>
      <button type="button" className="home-chat-trigger" onClick={() => setOpen(true)}>
        <span
          className="home-chat-trigger-close"
          role="button"
          aria-label="Close AI Chat launcher"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            closeLauncher();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              closeLauncher();
            }
          }}
        >
          ×
        </span>
        <span className="home-chat-trigger-kicker">AI Chat</span>
        <span className="home-chat-trigger-title">Ask about sponsors, salaries, and trends</span>
      </button>

      {open ? (
        <div className="chat-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="chat-modal-panel" onClick={(e) => e.stopPropagation()}>
            <ChatClient mode="modal" onClose={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
