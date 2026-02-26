import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import MobileNav from './nav/MobileNav';
import Script from 'next/script';


const navLink: React.CSSProperties = {
  textDecoration: 'none',
  color: '#111',
  fontSize: 14,
  fontWeight: 600,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://h1bfriend.com'),
  title: {
    default: 'H1B Friendly Jobs & Sponsors | H1B Friend',
    template: '%s | H1B Friend',
  },
  description:
    'Find H1B sponsorship jobs and explore H1B-friendly companies with verified public sponsorship data.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'H1B Friend',
    description:
      'Find H1B sponsorship jobs and explore H1B-friendly companies with verified public sponsorship data.',
    type: 'website',
    url: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
	{/* Google tag (gtag.js) — hard coded */}
<>
  <Script
    src="https://www.googletagmanager.com/gtag/js?id=G-L4D6N4ZFKW"
    strategy="afterInteractive"
  />
  <Script id="ga-gtag" strategy="afterInteractive">
    {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-L4D6N4ZFKW');
    `}
  </Script>
</>

        <header className="header">

<div className="header-inner">
            <a href="/" style={{ fontWeight: 800, textDecoration: 'none', color: '#111', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, background: '#4F46E5', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12 }}>H1</span>
              <span>H1B Friendly</span>
            </a>

            <nav className="nav-desktop">
              <a href="/rankings" style={navLink}>Rankings</a>
              <a href="/guides" style={navLink}>Guides</a>
            </nav>

            <div className="nav-mobile">
              <MobileNav />
            </div>
          </div>
        </header>

        <main className="container">{children}</main>

        <footer style={{ marginTop: 24, borderTop: '1px solid #eee', background: '#0B1220', color: '#C9D1D9' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 16px', fontSize: 13, lineHeight: 1.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ maxWidth: 520 }}>
                <div style={{ fontWeight: 800, color: '#fff' }}>H1B Friendly</div>
                <div style={{ marginTop: 6, color: '#9CA3AF' }}>
                  Find H1B sponsorship jobs and opportunities with companies that have a track record of sponsoring international talent.
                </div>
              </div>
              <div style={{ color: '#9CA3AF' }}>
                <div style={{ fontWeight: 700, color: '#fff' }}>Disclaimer</div>
                <div style={{ marginTop: 6 }}>Data from public sources. Not legal advice.</div>
              </div>
            </div>
            <div style={{ marginTop: 14, color: '#6B7280' }}>© {new Date().getFullYear()} H1B Friendly</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
