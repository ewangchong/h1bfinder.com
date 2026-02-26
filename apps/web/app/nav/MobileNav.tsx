'use client';

import { useEffect, useRef, useState } from 'react';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!open) return;
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button className="btn" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Open menu">
        Menu
      </button>

      {open ? (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 10px)',
            width: 220,
            borderRadius: 14,
            border: '1px solid #eee',
            background: '#fff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            zIndex: 50,
          }}
        >
          <a href="/rankings" style={itemStyle} onClick={() => setOpen(false)}>
            Rankings
          </a>
          <a href="/guides" style={itemStyle} onClick={() => setOpen(false)}>
            Guides
          </a>
        </div>
      ) : null}
    </div>
  );
}

const itemStyle: React.CSSProperties = {
  display: 'block',
  padding: '12px 12px',
  textDecoration: 'none',
  color: '#111',
  fontWeight: 700,
  fontSize: 14,
  borderTop: '1px solid #f2f2f2',
};
