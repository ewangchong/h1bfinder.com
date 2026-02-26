import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Practical guides for H1B sponsorship job search, OPT, and H1B timelines.',
};

const guides = [
  {
    slug: 'h1b-lottery-timeline',
    title: 'H1B lottery timeline: what happens when',
    desc: 'A simple month-by-month overview of the cap season, selection, and next steps.',
  },
  {
    slug: 'opt-to-h1b',
    title: 'OPT to H1B: realistic paths and pitfalls',
    desc: 'How students typically navigate OPT, STEM OPT, and H1B sponsorship.',
  },
];

export default function GuidesIndex() {
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '18px 0 6px' }}>
        <h1 style={{ margin: 0, fontSize: 34, letterSpacing: '-0.02em' }}>Guides</h1>
        <p style={{ margin: '10px auto 0', maxWidth: 760, color: '#555', lineHeight: 1.6 }}>
          Short, high-signal guides for international students and anyone needing H1B sponsorship. Not legal advice.
        </p>
      </div>

      <div
        className="grid2"
        style={{
          marginTop: 14,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 14,
        }}
      >
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            style={{
              display: 'block',
              padding: 14,
              borderRadius: 14,
              border: '1px solid #eee',
              background: '#fff',
              textDecoration: 'none',
              color: '#111',
              boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ fontWeight: 800 }}>{g.title}</div>
            <div style={{ marginTop: 6, color: '#666', fontSize: 13, lineHeight: 1.5 }}>{g.desc}</div>
          </Link>
        ))}
      </div>

      <style>{`
        @media (max-width: 720px) {
          .grid2 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        }
      `}</style>
    </div>
  );
}
