import Link from "next/link";
import type { Metadata } from "next";
import { listTitles, type TitleRow } from "@/lib/h1bApi";
import TitlesControls from "./TitlesControls";
import PaginationControls from "./PaginationControls";

const API_REVALIDATE_SECONDS = 60 * 60;

export const metadata: Metadata = {
  title: "Top H1B Jobs",
  description:
    "Explore jobs with high H1B sponsorship volume (based on public DOL LCA disclosure data).",
  alternates: { canonical: "/titles" },
};

export default async function TitlesPage({
  searchParams,
}: {
  searchParams: Promise<{
    keyword?: string;
    sortBy?: "filings" | "title";
    sortDirection?: "ASC" | "DESC";
    page?: string;
    size?: string;
    year?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page || 0) || 0);
  const size = Math.min(100, Math.max(1, Number(sp.size || 24) || 24));

  const base = process.env.H1B_API_BASE_URL || "http://127.0.0.1:3000";
  const yearsRes = await fetch(`${base}/api/v1/meta/years`, {
    next: { revalidate: API_REVALIDATE_SECONDS },
  });
  const yearsJson = yearsRes.ok ? await yearsRes.json() : { data: ["2025"] };
  const years = (yearsJson.data as number[]).map(String);
  const year = sp.year || years[0] || "2025";

  let titles;
  try {
    titles = await listTitles({
      page,
      size,
      keyword: sp.keyword,
      sortBy: sp.sortBy,
      sortDirection: sp.sortDirection,
      year,
    });
  } catch (e: any) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <h1 style={{ color: "#0f172a", fontSize: 24, fontWeight: 800 }}>Top Jobs</h1>
        <p style={{ color: "#ef4444", marginTop: 12 }}>Failed to load jobs from API.</p>
        <pre style={{ color: "#64748b", marginTop: 8, fontSize: 13, background: "#f8fafc", padding: 16, borderRadius: 12, display: "inline-block" }}>
          {String(e?.message || e)}
        </pre>
      </div>
    );
  }

  const totalTitles = titles.total_elements;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", paddingBottom: 80 }}>
      
      {/* 1. Page Header / Hero */}
      <div style={{ textAlign: "center", padding: "64px 20px 48px" }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#4f46e5",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            background: "#eef2ff",
            padding: "6px 14px",
            borderRadius: 999,
          }}>
            Discovery
          </span>
        </div>
        <h1 style={{ 
          margin: 0, 
          fontSize: "clamp(36px, 5vw, 52px)", 
          letterSpacing: "-0.04em",
          fontWeight: 900,
          color: "#0f172a",
          lineHeight: 1.1
        }}>
          Top H1B Jobs
        </h1>
        <p style={{
          margin: "18px auto 0",
          maxWidth: 640,
          color: "#475569",
          lineHeight: 1.7,
          fontSize: "clamp(16px, 2vw, 18px)",
          fontWeight: 500
        }}>
          Explore jobs with the highest historical sponsorship demand. Identify jobs with high approval rates to optimize your search strategy.
        </p>

        {/* Cross-Navigation Teaser */}
        <div style={{ marginTop: 32 }}>
          <Link href="/companies" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: "#f8fafc",
            color: "#475569",
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            border: "1px solid #e2e8f0",
            transition: "all 0.2s"
          }}>
            <span>Know your target company? Explore Top Sponsors</span>
            <span style={{ color: "#94a3b8" }}>→</span>
          </Link>
        </div>
      </div>

      {/* 2. Product Utility / Filters */}
      <div style={{ display: "flex", justifyContent: "center", padding: "0 20px" }}>
        <TitlesControls defaultYear={year} years={years} />
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* 3. Results Header */}
        <div style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>
            {totalTitles.toLocaleString()} <span style={{ color: "#64748b", fontWeight: 600, fontSize: 16 }}>Jobs in FY{year}</span>
          </div>
          <div style={{ color: "#64748b", fontSize: 13, fontWeight: 600, background: "#f1f5f9", padding: "4px 12px", borderRadius: 8 }}>
            Page {page + 1} of {titles.total_pages}
          </div>
        </div>

        {/* 4. Main Content Area */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
          gap: 20,
        }}>
          {titles.content.map((t) => (
            <TitleCard key={t.id} t={t} year={year} />
          ))}
        </div>

        {titles.content.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: '#f8fafc',
            borderRadius: 24,
            border: '2px dashed #e2e8f0'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>No job titles found</h3>
            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 480, margin: '0 auto 24px' }}>
              We couldn't find any job roles matching <strong>"{sp.keyword}"</strong> in FY{year}.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href={`/companies?keyword=${encodeURIComponent(sp.keyword || '')}`} style={{
                padding: '12px 24px',
                background: '#4f46e5',
                color: '#fff',
                borderRadius: 12,
                fontWeight: 700,
                textDecoration: 'none'
              }}>
                Search "{sp.keyword}" in Sponsors
              </Link>
              <Link href="/titles" style={{
                padding: '12px 24px',
                background: '#fff',
                border: '1px solid #e2e8f0',
                color: '#475569',
                borderRadius: 12,
                fontWeight: 700,
                textDecoration: 'none'
              }}>
                Clear Search
              </Link>
            </div>
          </div>
        )}

        {/* 5. Pagination */}
        <div style={{ marginTop: 40 }}>
          <PaginationControls page={titles.page} totalPages={titles.total_pages} />
        </div>

        {/* Footer Disclaimer Strip */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
          <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, maxWidth: 800, margin: "0 auto" }}>
            Data source: US Department of Labor LCA disclosure files. H1B Finder provides historical data visualization and does not guarantee future sponsorship or visa outcomes.
          </p>
        </div>
      </div>
    </div>
  );
}

function TitleCard({ t, year }: { t: TitleRow; year: string }) {
  const filed = t.filings ?? 0;
  const approved = t.approvals ?? 0;
  const rate = approved > 0 && filed > 0 ? approved / filed : null;

  return (
    <Link
      href={`/titles/${t.slug}?year=${year}`}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: "1px solid #e2e8f0",
        borderRadius: 20,
        padding: 24,
        textDecoration: "none",
        color: "#0f172a",
        background: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      className="card-hover-effect"
    >
      <style>{`
        .card-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01);
          border-color: #cbd5e1;
        }
      `}</style>

      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#eff6ff",
            display: "grid",
            placeItems: "center",
            color: "#2563eb",
            flexShrink: 0,
            border: "1px solid #bfdbfe"
          }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 999,
            background: "#f0f9ff",
            color: "#0369a1",
            border: "1px solid #bae6fd",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Eligible
          </span>
        </div>

        <div style={{
          marginTop: 16,
          fontWeight: 800,
          fontSize: 18,
          lineHeight: 1.3,
          letterSpacing: "-0.01em"
        }}>
          {t.title}
        </div>
      </div>

      <div style={{ 
        marginTop: 20, 
        paddingTop: 16,
        borderTop: "1px solid #f1f5f9",
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: 16 
      }}>
        <div>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600 }}>Filings</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginTop: 2 }}>
            {filed.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600 }}>Appr. Rate</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: rate && rate >= 0.9 ? "#059669" : "#0f172a", marginTop: 2 }}>
            {rate === null ? "—" : `${(rate * 100).toFixed(1)}%`}
          </div>
        </div>
      </div>
    </Link>
  );
}
