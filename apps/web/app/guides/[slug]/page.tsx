import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: string;
  content: Array<{ type: 'paragraph' | 'heading' | 'list'; text?: string; items?: string[] }>;
};

const guides: Guide[] = [
  {
    slug: 'how-to-find-h1b-sponsors',
    title: 'How to Find H1B Sponsors: A Step-by-Step Guide',
    description: 'Learn the exact process to identify and apply for companies that have a proven history of H1B visa sponsorship.',
    category: 'Sponsorship Strategy',
    content: [
      { type: 'paragraph', text: 'Finding H1B sponsorship as an international candidate requires a data-driven approach. You should focus on employers with a consistent history of Labor Condition Application (LCA) filings.' },
      { type: 'heading', text: 'Step 1: Check Official Filing Data' },
      { type: 'paragraph', text: 'Use tools like H1B Finder to search official DOL records. Look for the number of filings and the approval rate for your specific role.' },
      { type: 'heading', text: 'Step 2: Filter by Location and Role' },
      { type: 'paragraph', text: 'Some states have much higher sponsorship rates than others (e.g., California, Texas, New York). Focus your search on regions where your role is in high demand.' },
      { type: 'list', items: ['San Francisco for Software Engineers', 'New York for Finance', 'Austin for Emerging Tech'] },
      { type: 'heading', text: 'Step 3: Leverage My Plan' },
      { type: 'paragraph', text: 'Get a personalized roadmap by using our internal My Plan tool, which maps your background against historical demand.' }
    ]
  }
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find(g => g.slug === slug);
  if (!guide) return { title: 'Guide Not Found' };

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find(g => g.slug === slug);
  if (!guide) notFound();

  return (
    <article style={{ maxWidth: 820, margin: '0 auto', paddingBottom: 64 }}>
      <header style={{ padding: '48px 20px', textAlign: 'center' }}>
        <span style={{ padding: '6px 14px', borderRadius: 999, background: '#EFF6FF', color: '#1E40AF', fontSize: 13, fontWeight: 700 }}>
          {guide.category}
        </span>
        <h1 style={{ margin: '16px 0 0', fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-0.04em', color: '#0F172A', lineHeight: 1.1 }}>
          {guide.title}
        </h1>
        <p style={{ marginTop: 18, fontSize: 18, color: '#475569', lineHeight: 1.6 }}>
          {guide.description}
        </p>
      </header>

      <div style={{ padding: '32px 24px', borderRadius: 24, background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        {guide.content.map((block, idx) => {
           if (block.type === 'heading') return <h2 key={idx} style={{ marginTop: 32, fontSize: 24, fontWeight: 800 }}>{block.text}</h2>;
           if (block.type === 'list') return <ul key={idx} style={{ marginTop: 16 }}>{block.items?.map(i => <li key={i} style={{ marginTop: 8, color: '#475569' }}>{i}</li>)}</ul>;
           return <p key={idx} style={{ marginTop: 16, color: '#475569', lineHeight: 1.75, fontSize: 17 }}>{block.text}</p>;
        })}
        
        <div style={{ marginTop: 48, padding: 32, borderRadius: 20, background: '#F8FAF6', border: '1px solid #D1FAE5', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Ready to start your H1B journey?</h3>
          <Link href="/plan" style={{ display: 'inline-block', marginTop: 16, padding: '12px 28px', borderRadius: 999, background: '#059669', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
             Create Your Free H1B Plan →
          </Link>
        </div>
      </div>
    </article>
  );
}
