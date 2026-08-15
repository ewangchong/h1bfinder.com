import type { Metadata } from 'next';
import CommunityComments from './CommunityComments';

const REPO = 'ewangchong/h1bfinder.com';
const DISCUSSIONS_URL = `https://github.com/${REPO}/discussions`;
const FEED_URL = `${DISCUSSIONS_URL}.atom`;

export const metadata: Metadata = {
  title: 'H1B Community Discussions',
  description: 'Ask H1B questions, share sponsor experiences, and help improve H1B Finder with the community.',
  alternates: { canonical: '/community' },
};

type Discussion = {
  title: string;
  url: string;
  author: string;
  updatedAt: string;
  excerpt: string;
};

const categories = [
  {
    icon: 'Q',
    title: 'Ask the community',
    description: 'Questions about sponsors, job searches, salaries, and navigating H1B data.',
    href: `${DISCUSSIONS_URL}/new?category=q-a`,
    color: '#4f46e5',
    background: '#eef2ff',
  },
  {
    icon: 'S',
    title: 'Share your experience',
    description: 'Help others with a real interview, employer, transfer, or sponsorship experience.',
    href: `${DISCUSSIONS_URL}/new?category=show-and-tell`,
    color: '#047857',
    background: '#ecfdf5',
  },
  {
    icon: 'I',
    title: 'Suggest an improvement',
    description: 'Propose a feature, data view, guide, or workflow that would make H1B Finder better.',
    href: `${DISCUSSIONS_URL}/new?category=ideas`,
    color: '#b45309',
    background: '#fffbeb',
  },
] as const;

function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function tagValue(entry: string, tag: string) {
  const match = entry.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return decodeEntities(match?.[1]?.trim() || '');
}

function discussionLink(entry: string) {
  const match = entry.match(/<link[^>]+rel="alternate"[^>]+href="([^"]+)"/i)
    || entry.match(/<link[^>]+href="([^"]+)"[^>]+rel="alternate"/i);
  return decodeEntities(match?.[1] || DISCUSSIONS_URL);
}

function plainText(html: string) {
  return decodeEntities(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFeed(xml: string): Discussion[] {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].slice(0, 6).map((match) => {
    const entry = match[1];
    const excerpt = plainText(tagValue(entry, 'content'));
    return {
      title: tagValue(entry, 'title'),
      url: discussionLink(entry),
      author: tagValue(entry, 'name'),
      updatedAt: tagValue(entry, 'updated'),
      excerpt: excerpt.length > 180 ? `${excerpt.slice(0, 177)}...` : excerpt,
    };
  });
}

async function getRecentDiscussions() {
  try {
    const response = await fetch(FEED_URL, {
      headers: { Accept: 'application/atom+xml' },
      next: { revalidate: 900 },
    });
    if (!response.ok) return [];
    return parseFeed(await response.text());
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export default async function CommunityPage() {
  const discussions = await getRecentDiscussions();

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '44px 0 72px' }}>
      <section style={{ padding: '32px clamp(20px, 5vw, 56px)', borderRadius: 24, background: 'linear-gradient(135deg, #111827, #312e81)', color: '#fff' }}>
        <div style={{ color: '#c7d2fe', fontWeight: 800, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          H1B Finder Community
        </div>
        <h1 style={{ margin: '14px 0 0', fontSize: 'clamp(34px, 6vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.045em' }}>
          Ask, share, and help each other move forward.
        </h1>
        <p style={{ margin: '20px 0 0', maxWidth: 680, color: '#dbeafe', fontSize: 17, lineHeight: 1.7 }}>
          A public space for practical H1B questions, sponsor experiences, data feedback, and product ideas. Conversations are hosted on GitHub Discussions so they stay searchable and transparent.
        </p>
        <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href={`${DISCUSSIONS_URL}/new?category=general`} target="_blank" rel="noreferrer" style={primaryButtonStyle}>
            Start a discussion ↗
          </a>
          <a href={DISCUSSIONS_URL} target="_blank" rel="noreferrer" style={secondaryButtonStyle}>
            Browse all discussions
          </a>
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={sectionTitleStyle}>What would you like to do?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {categories.map((category) => (
            <a key={category.title} href={category.href} target="_blank" rel="noreferrer" style={categoryCardStyle}>
              <span style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 12, color: category.color, background: category.background, fontWeight: 900 }}>
                {category.icon}
              </span>
              <h3 style={{ margin: '18px 0 0', color: '#0f172a', fontSize: 18 }}>{category.title}</h3>
              <p style={{ margin: '9px 0 0', color: '#64748b', fontSize: 14, lineHeight: 1.65 }}>{category.description}</p>
              <span style={{ display: 'inline-block', marginTop: 18, color: '#4f46e5', fontSize: 13, fontWeight: 800 }}>Create a post ↗</span>
            </a>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 38 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ ...sectionTitleStyle, marginBottom: 6 }}>Community message board</h2>
          <div style={{ color: '#64748b', fontSize: 14 }}>
            Sign in with GitHub to leave a message, reply, or react without leaving H1B Finder.
          </div>
        </div>
        <div style={{ padding: '22px clamp(14px, 3vw, 28px)', borderRadius: 18, border: '1px solid #e2e8f0', background: '#fff' }}>
          <CommunityComments />
        </div>
      </section>

      <section style={{ marginTop: 38 }}>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <div>
            <h2 style={{ ...sectionTitleStyle, marginBottom: 6 }}>Latest conversations</h2>
            <div style={{ color: '#64748b', fontSize: 14 }}>Updated from GitHub Discussions.</div>
          </div>
          <a href={DISCUSSIONS_URL} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', fontWeight: 800, fontSize: 13 }}>View all ↗</a>
        </div>

        {discussions.length ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {discussions.map((discussion) => (
              <a key={discussion.url} href={discussion.url} target="_blank" rel="noreferrer" style={discussionCardStyle}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: 17, lineHeight: 1.4 }}>{discussion.title}</h3>
                  {discussion.excerpt ? <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{discussion.excerpt}</p> : null}
                  <div style={{ marginTop: 10, color: '#94a3b8', fontSize: 12 }}>
                    {discussion.author ? `@${discussion.author}` : 'Community'}{discussion.updatedAt ? ` · Updated ${formatDate(discussion.updatedAt)}` : ''}
                  </div>
                </div>
                <span aria-hidden="true" style={{ color: '#94a3b8', fontSize: 20 }}>→</span>
              </a>
            ))}
          </div>
        ) : (
          <div style={{ padding: 28, border: '1px solid #e2e8f0', borderRadius: 16, background: '#fff', color: '#64748b' }}>
            Recent discussions are temporarily unavailable. You can still browse and post directly on GitHub.
          </div>
        )}
      </section>

      <aside style={{ marginTop: 32, padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: 13, lineHeight: 1.65 }}>
        <strong style={{ color: '#0f172a' }}>Community note:</strong> Be respectful and avoid posting private immigration documents, receipt numbers, addresses, or other sensitive information. Posts and GitHub usernames are public. Community answers are informational and are not legal advice.
      </aside>
    </div>
  );
}

const sectionTitleStyle = {
  margin: '0 0 16px',
  color: '#0f172a',
  fontSize: 22,
  letterSpacing: '-0.025em',
} as const;

const primaryButtonStyle = {
  padding: '12px 18px',
  borderRadius: 10,
  background: '#fff',
  color: '#1e1b4b',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: 14,
} as const;

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  color: '#fff',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.35)',
} as const;

const categoryCardStyle = {
  padding: 22,
  borderRadius: 18,
  border: '1px solid #e2e8f0',
  background: '#fff',
  textDecoration: 'none',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
} as const;

const discussionCardStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 18,
  padding: 20,
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  background: '#fff',
  textDecoration: 'none',
} as const;
