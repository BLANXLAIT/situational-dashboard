# GDELT Geopolitical News Widget — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a widget showing real-time geopolitical/military conflict headlines from the GDELT DOC 2.0 API.

**Architecture:** New Cloud Function fetches from GDELT's free API (no key needed), deduplicates by title/domain, caches for 15 minutes. Frontend widget follows the NewsStreamWidget card pattern with a red accent.

**Tech Stack:** TypeScript (Cloud Functions), React + vanilla CSS (frontend), Vitest (tests)

---

### Task 1: Backend — GDELT data fetcher with tests

**Files:**
- Create: `functions/src/intelligence/gdelt.ts`
- Create: `functions/src/intelligence/__tests__/gdelt.test.ts`

**Step 1: Write the failing test**

Create `functions/src/intelligence/__tests__/gdelt.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('firebase-functions/logger', () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
}));

describe('getGeopoliticalNews', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns parsed articles from GDELT response', async () => {
        const mockResponse = {
            articles: [
                {
                    url: 'https://example.com/article1',
                    title: 'Military tensions rise in region',
                    seendate: '20260228T120000Z',
                    domain: 'example.com',
                    language: 'English',
                    sourcecountry: 'United States',
                },
                {
                    url: 'https://news.test/article2',
                    title: 'Sanctions imposed on country',
                    seendate: '20260228T110000Z',
                    domain: 'news.test',
                    language: 'English',
                    sourcecountry: 'United Kingdom',
                },
            ],
        };

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const { getGeopoliticalNews } = await import('../gdelt');
        const result = await getGeopoliticalNews();

        expect(result).toHaveLength(2);
        expect(result[0].title).toBe('Military tensions rise in region');
        expect(result[0].url).toBe('https://example.com/article1');
        expect(result[0].domain).toBe('example.com');
        expect(result[0].sourcecountry).toBe('United States');
        expect(result[0].seendate).toBe('20260228T120000Z');
    });

    it('deduplicates articles with the same title (case-insensitive)', async () => {
        const mockResponse = {
            articles: [
                { url: 'https://a.com/1', title: 'Breaking: conflict erupts', seendate: '20260228T120000Z', domain: 'a.com', language: 'English', sourcecountry: 'US' },
                { url: 'https://b.com/2', title: 'breaking: conflict erupts', seendate: '20260228T110000Z', domain: 'b.com', language: 'English', sourcecountry: 'UK' },
                { url: 'https://c.com/3', title: 'Different headline', seendate: '20260228T100000Z', domain: 'c.com', language: 'English', sourcecountry: 'CA' },
            ],
        };

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const { getGeopoliticalNews } = await import('../gdelt');
        const result = await getGeopoliticalNews();

        expect(result).toHaveLength(2);
    });

    it('deduplicates articles from the same domain', async () => {
        const mockResponse = {
            articles: [
                { url: 'https://reuters.com/1', title: 'Story A', seendate: '20260228T120000Z', domain: 'reuters.com', language: 'English', sourcecountry: 'US' },
                { url: 'https://reuters.com/2', title: 'Story B', seendate: '20260228T110000Z', domain: 'reuters.com', language: 'English', sourcecountry: 'US' },
                { url: 'https://bbc.com/3', title: 'Story C', seendate: '20260228T100000Z', domain: 'bbc.com', language: 'English', sourcecountry: 'UK' },
            ],
        };

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const { getGeopoliticalNews } = await import('../gdelt');
        const result = await getGeopoliticalNews();

        expect(result).toHaveLength(2);
        expect(result[0].domain).toBe('reuters.com');
        expect(result[1].domain).toBe('bbc.com');
    });

    it('limits output to 10 articles', async () => {
        const articles = Array.from({ length: 20 }, (_, i) => ({
            url: `https://site${i}.com/article`,
            title: `Unique headline ${i}`,
            seendate: '20260228T120000Z',
            domain: `site${i}.com`,
            language: 'English',
            sourcecountry: 'US',
        }));

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ articles }),
        });

        const { getGeopoliticalNews } = await import('../gdelt');
        const result = await getGeopoliticalNews();

        expect(result).toHaveLength(10);
    });

    it('throws when the API returns a non-ok status', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

        const { getGeopoliticalNews } = await import('../gdelt');
        await expect(getGeopoliticalNews()).rejects.toThrow('GDELT API returned status: 500');
    });

    it('returns empty array when API returns no articles', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        const { getGeopoliticalNews } = await import('../gdelt');
        const result = await getGeopoliticalNews();

        expect(result).toEqual([]);
    });
});
```

**Step 2: Run test to verify it fails**

Run: `cd functions && npx vitest run src/intelligence/__tests__/gdelt.test.ts`
Expected: FAIL — module `../gdelt` not found

**Step 3: Write the implementation**

Create `functions/src/intelligence/gdelt.ts`:

```typescript
import * as logger from "firebase-functions/logger";

const GDELT_API_URL = "https://api.gdeltproject.org/api/v2/doc/doc";
const GDELT_QUERY = '"military conflict" OR "geopolitical tension" OR "armed conflict" OR "sanctions" sourcelang:english';

export interface GdeltArticle {
    title: string;
    url: string;
    domain: string;
    sourcecountry: string;
    seendate: string;
}

interface CacheEntry {
    data: GdeltArticle[];
    fetchedAt: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_RESULTS = 10;

export async function getGeopoliticalNews(): Promise<GdeltArticle[]> {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        logger.info("Returning cached GDELT data");
        return cache.data;
    }

    logger.info("Fetching geopolitical news from GDELT...");

    const params = new URLSearchParams({
        query: GDELT_QUERY,
        mode: "artlist",
        maxrecords: "20",
        format: "json",
        sort: "date",
        timespan: "24h",
    });

    const response = await fetch(`${GDELT_API_URL}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`GDELT API returned status: ${response.status}`);
    }

    const data = await response.json();
    const articles: GdeltArticle[] = [];

    if (!data.articles || !Array.isArray(data.articles)) {
        cache = { data: [], fetchedAt: Date.now() };
        return [];
    }

    const seenTitles = new Set<string>();
    const seenDomains = new Set<string>();

    for (const article of data.articles) {
        if (articles.length >= MAX_RESULTS) break;

        const titleKey = article.title?.toLowerCase().trim();
        if (!titleKey || seenTitles.has(titleKey)) continue;
        if (seenDomains.has(article.domain)) continue;

        seenTitles.add(titleKey);
        seenDomains.add(article.domain);

        articles.push({
            title: article.title,
            url: article.url,
            domain: article.domain,
            sourcecountry: article.sourcecountry ?? "",
            seendate: article.seendate,
        });
    }

    cache = { data: articles, fetchedAt: Date.now() };
    return articles;
}
```

**Step 4: Run tests to verify they pass**

Run: `cd functions && npx vitest run src/intelligence/__tests__/gdelt.test.ts`
Expected: 6 tests PASS

**Step 5: Commit**

```bash
git add functions/src/intelligence/gdelt.ts functions/src/intelligence/__tests__/gdelt.test.ts
git commit -m "feat: add GDELT geopolitical news fetcher with dedup and tests"
```

---

### Task 2: Cloud Function endpoint and firebase.json route

**Files:**
- Modify: `functions/src/index.ts`
- Modify: `firebase.json`

**Step 1: Add the Cloud Function export to `functions/src/index.ts`**

Add import after line 15 (`import { getForexRates ... }`):

```typescript
import { getGeopoliticalNews as fetchGeopoliticalNews } from "./intelligence/gdelt";
```

Add endpoint after the `getGlobeEvents` export (after line 134):

```typescript
// Endpoint to fetch geopolitical news from GDELT
export const getGeopoliticalNews = onRequest({
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    timeoutSeconds: 120
}, async (request, response) => {
    logger.info("Fetching geopolitical news from GDELT...");
    try {
        const articles = await fetchGeopoliticalNews();
        response.json({ articles });
    } catch (error) {
        logger.error("Error fetching geopolitical news:", error);
        response.status(500).json({ error: "Failed to fetch geopolitical news" });
    }
});
```

**Step 2: Add route to `firebase.json`**

Add before the `"source": "**"` catch-all rewrite:

```json
{
    "source": "/api/alerts/geopolitical",
    "function": "getGeopoliticalNews"
},
```

**Step 3: Verify functions build**

Run: `cd functions && npm run build`
Expected: Clean build, no errors

**Step 4: Commit**

```bash
git add functions/src/index.ts firebase.json
git commit -m "feat: add getGeopoliticalNews endpoint and firebase route"
```

---

### Task 3: Frontend — GeopoliticalWidget with tests

**Files:**
- Create: `src/components/widgets/GeopoliticalWidget.jsx`
- Create: `src/components/widgets/GeopoliticalWidget.css`
- Create: `src/components/widgets/__tests__/GeopoliticalWidget.test.jsx`

**Step 1: Write the failing test**

Create `src/components/widgets/__tests__/GeopoliticalWidget.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import GeopoliticalWidget from '../GeopoliticalWidget';

describe('GeopoliticalWidget', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('shows loading state initially', () => {
        global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
        render(<GeopoliticalWidget onRemove={vi.fn()} />);
        expect(screen.getByText(/monitoring geopolitical/i)).toBeInTheDocument();
    });

    it('renders article headlines after fetch', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                articles: [
                    { title: 'Tensions rise in region', url: 'https://example.com/1', domain: 'example.com', sourcecountry: 'United States', seendate: '20260228T120000Z' },
                ],
            }),
        });

        render(<GeopoliticalWidget onRemove={vi.fn()} />);
        await waitFor(() => {
            expect(screen.getByText('Tensions rise in region')).toBeInTheDocument();
        });
        expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    it('shows error state when fetch fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

        render(<GeopoliticalWidget onRemove={vi.fn()} />);
        await waitFor(() => {
            expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
        });
    });

    it('shows empty state when no articles', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ articles: [] }),
        });

        render(<GeopoliticalWidget onRemove={vi.fn()} />);
        await waitFor(() => {
            expect(screen.getByText(/no significant geopolitical/i)).toBeInTheDocument();
        });
    });

    it('renders article links with correct href', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                articles: [
                    { title: 'Test article', url: 'https://example.com/article', domain: 'example.com', sourcecountry: 'US', seendate: '20260228T120000Z' },
                ],
            }),
        });

        render(<GeopoliticalWidget onRemove={vi.fn()} />);
        await waitFor(() => {
            const link = screen.getByRole('link', { name: /test article/i });
            expect(link).toHaveAttribute('href', 'https://example.com/article');
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/widgets/__tests__/GeopoliticalWidget.test.jsx`
Expected: FAIL — module not found

**Step 3: Write the CSS**

Create `src/components/widgets/GeopoliticalWidget.css`:

```css
.geopolitical-card-link {
    display: block;
    text-decoration: none;
    color: inherit;
}

.geopolitical-external-icon {
    display: inline-block;
    margin-left: 6px;
    opacity: 0;
    transition: opacity var(--transition-fast);
    vertical-align: middle;
}

.geopolitical-card-link:hover .geopolitical-external-icon {
    opacity: 1;
}

.geopolitical-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--border-glass-hover);
    border-radius: var(--radius-md);
    padding: 16px;
    transition: all var(--transition-fast);
    position: relative;
    overflow: hidden;
}

.geopolitical-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #ef4444, transparent);
    opacity: 0.5;
}

.geopolitical-card:hover {
    background: rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.geopolitical-card:hover::before {
    opacity: 1;
}

.geopolitical-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 600;
}

.geopolitical-domain {
    color: #f87171;
    background: rgba(239, 68, 68, 0.15);
    padding: 2px 8px;
    border-radius: var(--radius-sm);
}

.geopolitical-time {
    color: var(--text-muted);
}

.geopolitical-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
    line-height: 1.3;
}

.geopolitical-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    border-top: 1px solid var(--border-glass);
    padding-top: 12px;
}

.geopolitical-country {
    color: var(--text-muted);
    font-style: italic;
}
```

**Step 4: Write the component**

Create `src/components/widgets/GeopoliticalWidget.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import WidgetContainer from './WidgetContainer';
import './GeopoliticalWidget.css';

function formatGdeltDate(seendate) {
    if (!seendate) return '';
    // GDELT format: "20260228T120000Z"
    const year = seendate.slice(0, 4);
    const month = seendate.slice(4, 6);
    const day = seendate.slice(6, 8);
    const hour = seendate.slice(9, 11);
    const minute = seendate.slice(11, 13);
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`);
    if (isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    if (diffHrs < 1) return `${Math.floor(diffMs / 60000)} mins ago`;
    if (diffHrs < 24) return `${diffHrs} hrs ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
}

export default function GeopoliticalWidget({ onRemove }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchArticles() {
            try {
                const response = await fetch('/api/alerts/geopolitical');
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                const data = await response.json();
                setArticles(data.articles || []);
                setError(null);
            } catch (e) {
                console.error("Failed to fetch geopolitical news.", e);
                setError("Unable to connect to Geopolitical News Feed.");
            } finally {
                setLoading(false);
            }
        }

        fetchArticles();
        const interval = setInterval(fetchArticles, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetContainer
            title="Geopolitical News"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
            color="#ef4444"
            onRemove={onRemove}
        >
            <div className="geopolitical-stream flex-column gap-md">
                {loading ? (
                    <div className="loading-state" style={{ color: 'var(--text-secondary)' }}>Monitoring geopolitical signals...</div>
                ) : error ? (
                    <div className="error-state" style={{ color: 'var(--color-danger)' }}>{error}</div>
                ) : articles.length === 0 ? (
                    <div className="empty-state">No significant geopolitical events detected.</div>
                ) : (
                    articles.map((article, idx) => (
                        <a
                            key={`${article.domain}-${idx}`}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="geopolitical-card-link"
                        >
                            <div className="geopolitical-card">
                                <div className="geopolitical-meta">
                                    <span className="geopolitical-domain">{article.domain}</span>
                                    <span className="geopolitical-time">{formatGdeltDate(article.seendate)}</span>
                                </div>
                                <h4 className="geopolitical-title">
                                    {article.title}
                                    <svg className="geopolitical-external-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                        <polyline points="15 3 21 3 21 9"/>
                                        <line x1="10" y1="14" x2="21" y2="3"/>
                                    </svg>
                                </h4>
                                <div className="geopolitical-footer">
                                    <span className="geopolitical-country">{article.sourcecountry}</span>
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </WidgetContainer>
    );
}
```

**Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/widgets/__tests__/GeopoliticalWidget.test.jsx`
Expected: 5 tests PASS

**Step 6: Commit**

```bash
git add src/components/widgets/GeopoliticalWidget.jsx src/components/widgets/GeopoliticalWidget.css src/components/widgets/__tests__/GeopoliticalWidget.test.jsx
git commit -m "feat: add GeopoliticalWidget frontend component with tests"
```

---

### Task 4: Dashboard registration

**Files:**
- Modify: `src/components/Dashboard.jsx`

**Step 1: Add import**

Add after line 6 (`import NewsStreamWidget`):

```jsx
import GeopoliticalWidget from './widgets/GeopoliticalWidget';
```

**Step 2: Add to AVAILABLE_WIDGETS array**

Add after the `news` entry (after line 23):

```jsx
{ id: 'geopolitical', label: 'Geopolitical News', component: GeopoliticalWidget, domain: 'Intelligence' },
```

**Step 3: Run all tests**

Run: `npm test && cd functions && npm test`
Expected: All tests pass (frontend + backend)

**Step 4: Commit**

```bash
git add src/components/Dashboard.jsx
git commit -m "feat: register GeopoliticalWidget in dashboard"
```

---

### Task 5: Final verification

**Step 1: Build functions**

Run: `cd functions && npm run build`
Expected: Clean build

**Step 2: Build frontend**

Run: `npm run build`
Expected: Clean build

**Step 3: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 4: Run all tests one final time**

Run: `npm test && cd functions && npm test`
Expected: All pass
