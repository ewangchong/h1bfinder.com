import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const guideBySlug: Record<string, { title: string; content: React.ReactNode; description: string }> = {
  'h1b-lottery-timeline': {
    title: 'H1B lottery timeline: what happens when',
    description: 'A month-by-month overview of the H1B cap season timeline and next steps.',
    content: (
      <>
        <p>
          This guide explains the typical H1B cap season timeline in plain English. Exact dates change every year.
        </p>
        <h2>Quick timeline</h2>
        <ul>
          <li>Registration opens (usually March)</li>
          <li>Selections announced</li>
          <li>Petitions filed (90-day window)</li>
          <li>Results + RFEs + approvals</li>
          <li>Start date (typically Oct 1)</li>
        </ul>
        <h2>What to do</h2>
        <ol>
          <li>Confirm your employer is ready to file quickly after selection.</li>
          <li>Prepare documents early (education, passports, prior status).</li>
          <li>Understand cap-gap if you are on F-1 OPT.</li>
        </ol>
        <p style={{ color: '#555' }}>Not legal advice.</p>
      </>
    ),
  },
  'opt-to-h1b': {
    title: 'OPT to H1B: realistic paths and pitfalls',
    description: 'How international students usually navigate OPT, STEM OPT, and H1B sponsorship.',
    content: (
      <>
        <p>
          OPT is often the bridge to an H1B. The biggest constraint is timing: lottery + start dates rarely align
          neatly with your OPT end date.
        </p>
        <h2>Common paths</h2>
        <ul>
          <li>OPT → H1B (selected) → employment continues</li>
          <li>OPT → STEM OPT → multiple lottery attempts</li>
          <li>OPT ends before selection → consider other lawful options</li>
        </ul>
        <h2>Pitfalls</h2>
        <ul>
          <li>Relying on "maybe we sponsor later" without written clarity</li>
          <li>Missing STEM OPT requirements (E-Verify, I-983, reporting)</li>
          <li>Assuming your job title guarantees sponsorship</li>
        </ul>
        <p style={{ color: '#555' }}>Not legal advice.</p>
      </>
    ),
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = guideBySlug[slug];
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    alternates: {
      canonical: `/guides/${slug}`,
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guideBySlug[slug];
  if (!g) return notFound();

  return (
    <article>
      <div
        style={{
          border: '1px solid #eee',
          borderRadius: 16,
          padding: 16,
          background: '#fff',
          boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, letterSpacing: '-0.02em' }}>{g.title}</h1>
        <div style={{ marginTop: 10, color: '#444', lineHeight: 1.7 }}>{g.content}</div>
      </div>
    </article>
  );
}
