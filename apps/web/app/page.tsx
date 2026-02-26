import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <section
        style={{
          textAlign: 'center',
          padding: '26px 0 10px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 40, letterSpacing: '-0.02em' }}>Find Your Dream Job with H1B Sponsorship</h1>
        <p style={{ margin: '10px auto 0', maxWidth: 820, color: '#555', lineHeight: 1.6, fontSize: 16 }}>
          Explore companies with H1B sponsorship activity based on public data, and discover roles more likely to sponsor.
        </p>
      </section>

      <section
        className="grid2home"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginTop: 16 }}
      >
        <Card title="Rankings" desc="Top sponsors by role, state, and year." href="/rankings" />
        <Card title="Guides" desc="High-signal resources for OPT → H1B." href="/guides" />
      </section>

      <section style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>Start here</div>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <MiniLink href="/guides/h1b-lottery-timeline" title="H1B lottery timeline" desc="What happens when, step-by-step." />
          <MiniLink href="/guides/opt-to-h1b" title="OPT to H1B" desc="Realistic paths and common pitfalls." />
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .grid2home { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 500px) {
          .grid2home { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        }
      `}</style>
    </div>
  );
}

function MiniLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: 14,
        borderRadius: 14,
        border: '1px solid #eee',
        background: '#fff',
        textDecoration: 'none',
        color: '#111',
      }}
    >
      <div style={{ fontWeight: 800 }}>{title}</div>
      <div style={{ marginTop: 4, color: '#666', fontSize: 13 }}>{desc}</div>
    </Link>
  );
}

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: 16,
        border: '1px solid #eee',
        borderRadius: 12,
        textDecoration: 'none',
        color: '#111',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ color: '#555', fontSize: 14 }}>{desc}</div>
    </Link>
  );
}
