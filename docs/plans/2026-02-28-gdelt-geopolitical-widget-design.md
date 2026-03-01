# GDELT Geopolitical News Widget — Design

**Issue:** #16
**Date:** 2026-02-28

## Goal

Add a widget that surfaces real-time geopolitical and military conflict headlines from the GDELT DOC 2.0 API, complementing the existing Hacker News intelligence stream.

## Data Source

- **API:** `https://api.gdeltproject.org/api/v2/doc/doc`
- **No API key required**, no documented rate limit
- **Query:** `"military conflict" OR "geopolitical tension" OR "armed conflict" OR "sanctions" sourcelang:english`
- **Params:** `mode=artlist`, `maxrecords=20`, `timespan=24h`, `sort=date`, `format=json`
- **Note:** `sourcelang:english` must go inside the `query` param, not as a separate URL parameter

## Backend

**New file:** `functions/src/intelligence/gdelt.ts`

- Fetch 20 articles from GDELT
- Simple dedup: skip articles with duplicate titles (case-insensitive) or same domain
- Return top 10 after dedup
- 15-minute in-memory cache
- Response shape: `{ articles: [{ title, url, domain, sourcecountry, seendate }] }`

**Cloud Function:** `getGeopoliticalNews` in `functions/src/index.ts`

- No secrets config (free API)
- Standard CORS + `invoker: "public"`

**Route:** `/api/alerts/geopolitical` in `firebase.json`

## Frontend

**New files:** `src/components/widgets/GeopoliticalWidget.jsx` + `.css`

- Follows `NewsStreamWidget` pattern: clickable headline cards with domain badge, source country, timestamp
- Accent color: `#ef4444` (red)
- 15-minute refresh interval

**Dashboard registration:**

```js
{ id: 'geopolitical', label: 'Geopolitical News', component: GeopoliticalWidget, domain: 'Intelligence' }
```

## Out of scope

- Gemini consolidator integration (future enhancement)
- Globe aggregator integration (future enhancement)
- Timeline/trend sparkline (`timelinevol` mode — future widget)
