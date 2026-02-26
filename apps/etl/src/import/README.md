# Import scripts

Goal: pull public data (USCIS/DOL/etc), normalize it, and load into Postgres.

For now we provide a simple JSON import interface to unblock local testing.

## Import companies from JSON

Create a JSON file like:

```json
[
  {
    "name": "Example Tech Inc",
    "domain": "example.com",
    "website_url": "https://example.com",
    "industry": "Software",
    "headquarters_city": "San Francisco",
    "headquarters_state": "CA",
    "headquarters_country": "US",
    "h1b_sponsorship_status": "active",
    "h1b_sponsorship_confidence": 0.92
  }
]
```

Run:

```bash
npm run import:companies -- ./data/companies.json
```
