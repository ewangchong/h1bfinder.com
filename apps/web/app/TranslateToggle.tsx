'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

function isChineseActive() {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes('googtrans=/en/zh-CN');
}

function setLanguage(lang: 'en' | 'zh-CN') {
  const target = document.querySelector('select.goog-te-combo') as HTMLSelectElement | null;
  if (!target) return false;
  target.value = lang;
  target.dispatchEvent(new Event('change'));
  return true;
}

function setGoogTransCookie(lang: 'en' | 'zh-CN') {
  if (typeof document === 'undefined') return;
  const value = lang === 'zh-CN' ? '/en/zh-CN' : '/en/en';
  const host = window.location.hostname;
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; domain=.${host}; path=/`;
}

export default function TranslateToggle() {
  const [ready, setReady] = useState(false);
  const [isZh, setIsZh] = useState(false);

  useEffect(() => {
    setIsZh(isChineseActive());

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      // Keep widget hidden; we only use its language switch behavior.
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,zh-CN',
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );
      setReady(true);
    };

    if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
      return;
    }

    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  function handleToggle() {
    const next = isZh ? 'en' : 'zh-CN';
    const ok = setLanguage(next);
    setGoogTransCookie(next);

    if (ok) {
      setIsZh(next === 'zh-CN');
      return;
    }

    // Fallback: if Google widget is delayed/blocked, cookie + reload usually applies translation.
    window.location.reload();
  }

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }} />
      <button
        type="button"
        onClick={handleToggle}
        disabled={!ready}
        title={ready ? 'Translate page' : 'Loading translator...'}
        style={{
          border: '1px solid #d4d4d8',
          background: '#fff',
          color: '#111',
          borderRadius: 999,
          padding: '8px 12px',
          fontWeight: 700,
          fontSize: 12,
          cursor: ready ? 'pointer' : 'not-allowed',
          opacity: ready ? 1 : 0.6,
        }}
      >
        {isZh ? 'English' : '中文'}
      </button>
    </>
  );
}
