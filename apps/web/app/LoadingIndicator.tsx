'use strict';
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function LoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When the path or search params change, we consider navigation finished
    setLoading(false);
    setProgress(0);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) return;
      
      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');

      // Only handle internal links that aren't opening in a new tab
      if (
        href && 
        href.startsWith('/') && 
        (!targetAttr || targetAttr === '_self') &&
        href !== pathname // Don't show for current page
      ) {
        setLoading(true);
        setProgress(30);
        
        // Simulate progress increment
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 5;
          });
        }, 100);

        return () => clearInterval(interval);
      }
    };

    window.addEventListener('click', handleAnchorClick);
    return () => window.removeEventListener('click', handleAnchorClick);
  }, [pathname]);

  if (!loading) return null;

  return (
    <>
      <div className="loading-bar-container">
        <div 
          className="loading-bar" 
          style={{ width: `${progress}%` }} 
        />
      </div>
      <div className="nav-mask active" />
    </>
  );
}
