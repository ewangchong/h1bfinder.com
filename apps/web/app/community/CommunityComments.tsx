'use client';

import { useEffect, useRef } from 'react';

export default function CommunityComments() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.dataset.loaded === 'true') return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', 'ewangchong/h1bfinder.com');
    script.setAttribute('data-repo-id', 'R_kgDORZp9Ow');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDORZp9O84C3-54');
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', 'H1B Finder Community Message Board');
    script.setAttribute('data-strict', '1');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');

    container.dataset.loaded = 'true';
    container.appendChild(script);

    return () => {
      container.replaceChildren();
      delete container.dataset.loaded;
    };
  }, []);

  return <div ref={containerRef} className="giscus" />;
}
