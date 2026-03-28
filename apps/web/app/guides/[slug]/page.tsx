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
  },
  {
    slug: 'cap-exempt-h1b-sponsors',
    title: 'Cap-Exempt H1B Sponsors: Skip the Lottery',
    description: 'Discover how to completely bypass the annual H1B lottery by applying to cap-exempt institutions like universities, research facilities, and non-profits.',
    category: 'Visa Alternatives',
    content: [
      { type: 'paragraph', text: 'With the annual H1B lottery selection rate dropping, finding a cap-exempt employer is one of the most reliable ways to secure your work authorization in the US without relying on luck.' },
      { type: 'heading', text: 'What is a Cap-Exempt Employer?' },
      { type: 'paragraph', text: 'Cap-exempt employers are not subject to the 85,000 annual visa limit. This means they can sponsor your H1B visa at any time of the year, and there is no lottery involved.' },
      { type: 'heading', text: 'Top Types of Cap-Exempt Sponsors' },
      { type: 'list', items: ['Institutions of Higher Education (Universities and Colleges)', 'Non-profit entities related to or affiliated with a university', 'Non-profit research organizations', 'Government research organizations'] },
      { type: 'heading', text: 'How to Search for Them' },
      { type: 'paragraph', text: 'When using H1B Finder, look for employers with "University", "College", "Institute", or "Research" in their names. Because these institutions pay lower average salaries than big tech, the competition is usually lower, making them excellent stepping stones.' }
    ]
  },
  {
    slug: 'highest-paying-h1b-sponsors',
    title: 'Highest Paying H1B Sponsors in Tech',
    description: 'A data-backed look at the tech giants and quantitative trading firms offering the highest average salaries for H1B workers.',
    category: 'Salary Insights',
    content: [
      { type: 'paragraph', text: 'H1B salary data is uniquely transparent because employers are legally required to disclose the prevailing wage and actual wage paid on their Labor Condition Applications (LCAs).' },
      { type: 'heading', text: 'The FAANG Baseline' },
      { type: 'paragraph', text: 'Companies like Meta, Google, and Apple consistently sponsor thousands of H1B visas. For a Software Engineer, the base salary floor on an LCA for these companies typically starts around $150,000 to $180,000, excluding massive equity grants.' },
      { type: 'heading', text: 'The True Top Payers: Quant & Trading' },
      { type: 'paragraph', text: 'If you are looking for the absolute highest LCA salaries, high-frequency trading (HFT) firms in Chicago and New York take the crown. Firms like Citadel, Jane Street, and Two Sigma frequently file LCAs with base salaries exceeding $250,000 for entry to mid-level quantitative researchers and software engineers.' },
      { type: 'heading', text: 'How to Maximize Your Offer' },
      { type: 'list', items: ['Target Level 3 or Level 4 wage levels on the prevailing wage determination', 'Focus on HCOL (High Cost of Living) areas where mandatory minimums are legally higher', 'Negotiate your base salary using our H1B salary data as leverage. Companies cannot legally pay below the prevailing wage.'] }
    ]
  },
  {
    slug: 'h1b-sponsors-in-texas',
    title: 'Top H1B Sponsors in Texas: The New Tech Hub',
    description: 'Why Texas is rapidly becoming the best state for international students to find H1B tech jobs.',
    category: 'Location Focus',
    content: [
      { type: 'paragraph', text: 'Texas has firmly established itself as a premier destination for international talent, offering a potent combination of massive tech investment, zero state income tax, and a lower cost of living compared to California or New York.' },
      { type: 'heading', text: 'The "Silicon Hills" of Austin' },
      { type: 'paragraph', text: 'Austin is ground zero for H1B growth in Texas. Major employers like Tesla, Apple, and Dell have massively expanded their footprints here, resulting in thousands of new LCA filings annually.' },
      { type: 'heading', text: 'Dallas & Houston: Enterprise Tech' },
      { type: 'paragraph', text: 'While Austin gets the startup hype, Dallas and Houston are heavyweights for enterprise IT and energy sector sponsorships. Financial giants like Charles Schwab (Dallas) and telecom leaders are highly reliable, stable sponsors.' },
      { type: 'heading', text: 'Texas vs. California' },
      { type: 'paragraph', text: 'While California still holds the raw volume record for H1B filings, Texas offers a significantly higher standard of living per H1B dollar earned. An H1B worker making $120,000 in Austin often enjoys more purchasing power than one making $160,000 in the Bay Area.' }
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
