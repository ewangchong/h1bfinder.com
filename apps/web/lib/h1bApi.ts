type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  timestamp?: string;
  message?: string;
};

type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type Company = {
  id: string;
  slug?: string;
  name: string;
  domain?: string;
  website_url?: string;
  industry?: string;
  headquarters_city?: string;
  headquarters_state?: string;
  headquarters_country?: string;
  h1b_sponsorship_status?: string;
  h1b_sponsorship_confidence?: number;
  h1b_applications_filed?: number;
  h1b_applications_approved?: number;
  last_h1b_filing_year?: number;
  active_job_count?: number;
};

export type Job = {
  id: string;
  title: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  company_id?: string;
  company_name?: string;
  posted_date?: string;
  h1b_sponsorship_available?: boolean;
};

function baseUrl() {
  const raw = process.env.H1B_API_BASE_URL;
  if (!raw) {
    // Conservative default for local: you can point this to an API gateway later.
    return 'http://127.0.0.1:3000';
  }
  return raw.replace(/\/$/, '');
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const isDev = process.env.NODE_ENV === 'development';
  const caching: RequestInit & { next?: { revalidate: number } } = isDev
    ? { cache: 'no-store' }
    : { next: { revalidate: 60 * 60 } }; // 1h (tune later)

  const res = await fetch(url, {
    ...init,
    ...caching,
  });
  if (!res.ok) throw new Error(`API ${res.status} for ${url}`);
  return res.json();
}

export async function getAvailableYears() {
  const data = await fetchJson<ApiEnvelope<number[]>>('/api/v1/meta/years');
  return data.data;
}

export async function listCompanies(params?: {
  page?: number;
  size?: number;
  keyword?: string;
  sortBy?: 'filed' | 'name';
  sortDirection?: 'ASC' | 'DESC';
  year?: string;
}) {
  const page = params?.page ?? 0;
  const size = params?.size ?? 20;
  const keyword = params?.keyword;
  const sortBy = params?.sortBy;
  const sortDirection = params?.sortDirection;
  const year = params?.year;

  const sp = new URLSearchParams({ page: String(page), size: String(size) });
  if (keyword) sp.set('keyword', keyword);
  if (sortBy) sp.set('sortBy', sortBy);
  if (sortDirection) sp.set('sortDirection', sortDirection);
  if (year) sp.set('year', year);

  const data = await fetchJson<ApiEnvelope<PageResponse<Company>>>(`/api/v1/companies?${sp.toString()}`);
  return data.data;
}

export async function getCompanyById(id: string) {
  const data = await fetchJson<ApiEnvelope<Company>>(`/api/v1/companies/${id}`);
  return data.data;
}

export async function getCompanyBySlug(slug: string) {
  const data = await fetchJson<ApiEnvelope<Company>>(`/api/v1/companies/slug/${slug}`);
  return data.data;
}

export type CompanyInsights = {
  top_titles: Array<{ title: string; title_slug?: string; filings: number; approvals: number }>;
  top_states: Array<{ state: string; filings: number }>;
  trend: Array<{ year: number; filings: number; approvals: number }>;
};

export async function getCompanyInsightsBySlug(slug: string, year?: string) {
  const sp = new URLSearchParams();
  if (year) sp.set('year', year);
  const qs = sp.toString();
  const data = await fetchJson<ApiEnvelope<CompanyInsights>>(`/api/v1/companies/slug/${slug}/insights${qs ? `?${qs}` : ''}`);
  return data.data;
}

export async function listJobs(params?: {
  page?: number;
  size?: number;
  keyword?: string;
  state?: string;
  year?: string;
  sortBy?: 'year' | 'title' | 'company';
  sortDirection?: 'ASC' | 'DESC';
}) {
  const page = params?.page ?? 0;
  const size = params?.size ?? 24;

  const sp = new URLSearchParams({ page: String(page), size: String(size) });
  if (params?.keyword) sp.set('keyword', params.keyword);
  if (params?.state) sp.set('state', params.state);
  if (params?.year) sp.set('year', params.year);
  if (params?.sortBy) sp.set('sortBy', params.sortBy);
  if (params?.sortDirection) sp.set('sortDirection', params.sortDirection);

  const data = await fetchJson<ApiEnvelope<PageResponse<Job>>>(`/api/v1/jobs?${sp.toString()}`);
  return data.data;
}

export async function getJob(id: string) {
  const data = await fetchJson<ApiEnvelope<Job>>(`/api/v1/jobs/${id}`);
  return data.data;
}

export type Ranking = {
  employer_norm: string;
  company_name: string;
  company_slug?: string;
  filings: number;
  approvals: number;
  avg_salary: string | number;
};

export async function getRankings(params?: {
  year?: string;
  state?: string;
  city?: string;
  job_title?: string;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.year) sp.set('year', params.year);
  if (params?.state) sp.set('state', params.state);
  if (params?.city) sp.set('city', params.city);
  if (params?.job_title) sp.set('job_title', params.job_title);
  if (params?.limit) sp.set('limit', String(params.limit));

  const data = await fetchJson<ApiEnvelope<Ranking[]>>(`/api/v1/rankings?${sp.toString()}`);
  return data.data;
}
