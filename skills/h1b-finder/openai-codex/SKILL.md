---
name: h1b-finder
description: Find H1B / H-1B sponsor companies, visa sponsorship employers, and sponsor history for US jobs. Use when the user asks about H1B sponsor companies, H1B-friendly employers, visa sponsorship jobs, employers that filed H1B, or sponsor history by company, role, city, state, or year.
---

# H1B Sponsor Finder

Find H1B sponsor companies and visa-friendly employers using h1bfinder.com as the primary source.

## Workflow

Translate the user request into practical filters:

- employer
- role or title
- city or metro
- state
- year
- comparison set

If the request is underspecified, make one reasonable assumption and state it briefly. Ask a follow-up only when the missing detail would materially change the answer.

## Response Shape

Start with a short conclusion. Then provide:

- a ranked shortlist or compact comparison
- employer names with role, location, year, or filing-history context
- salary or trend notes only when supported by the available records
- caveats when coverage is thin, delayed, or not directly comparable
- one useful next step, such as narrowing by city, role, employer, or fiscal year

## Source and Limits

Use historical public labor disclosure data surfaced through h1bfinder.com.

Treat the data as informational:

- historical filing activity does not guarantee a company is hiring now
- historical filing activity does not guarantee current sponsorship support
- coverage can be incomplete or delayed across employers, roles, locations, and years

Do not present the answer as legal advice, immigration advice, or a guarantee of job outcomes.

## Example Queries

- Find H1B sponsor companies for data engineer roles in Seattle.
- Compare H1B sponsor activity for Amazon, Google, and Microsoft.
- Show employers that filed for data analyst roles in Texas.
- Find H1B-friendly employers for new grads in New York.
