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
                { url: 'https://example.com/article1', title: 'Military tensions rise in region', seendate: '20260228T120000Z', domain: 'example.com', language: 'English', sourcecountry: 'United States' },
                { url: 'https://news.test/article2', title: 'Sanctions imposed on country', seendate: '20260228T110000Z', domain: 'news.test', language: 'English', sourcecountry: 'United Kingdom' },
            ],
        };

        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResponse });

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

        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResponse });

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

        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockResponse });

        const { getGeopoliticalNews } = await import('../gdelt');
        const result = await getGeopoliticalNews();

        expect(result).toHaveLength(2);
        expect(result[0].domain).toBe('reuters.com');
        expect(result[1].domain).toBe('bbc.com');
    });

    it('limits output to 10 articles', async () => {
        const articles = Array.from({ length: 20 }, (_, i) => ({
            url: `https://site${i}.com/article`, title: `Unique headline ${i}`, seendate: '20260228T120000Z', domain: `site${i}.com`, language: 'English', sourcecountry: 'US',
        }));

        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ articles }) });

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
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

        const { getGeopoliticalNews } = await import('../gdelt');
        const result = await getGeopoliticalNews();

        expect(result).toEqual([]);
    });
});
