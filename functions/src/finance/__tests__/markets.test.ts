import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock firebase-functions/logger to avoid initialization errors in tests
vi.mock('firebase-functions/logger', () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
}));

function makeFredResponse(latestValue: string, prevValue: string, latestDate: string, prevDate: string) {
    return {
        observations: [
            { date: latestDate, value: latestValue },
            { date: prevDate, value: prevValue },
        ],
    };
}

describe('getMarketQuotes', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns market data parsed from FRED observations', async () => {
        global.fetch = vi.fn().mockImplementation((url: string) => {
            if (url.includes('SP500')) {
                return Promise.resolve({ ok: true, json: async () => makeFredResponse('5900.00', '5870.00', '2026-02-28', '2026-02-27') });
            } else if (url.includes('NASDAQCOM')) {
                return Promise.resolve({ ok: true, json: async () => makeFredResponse('19200.50', '19300.00', '2026-02-28', '2026-02-27') });
            } else {
                return Promise.resolve({ ok: true, json: async () => makeFredResponse('43500.00', '43200.00', '2026-02-28', '2026-02-27') });
            }
        });

        const { getMarketQuotes } = await import('../markets');
        const result = await getMarketQuotes('test-api-key');

        expect(result).toHaveLength(3);
        expect(result[0].symbol).toBe('SP500');
        expect(result[0].name).toBe('S&P 500');
        expect(result[0].price).toContain('5,900.00');
        expect(result[0].changePct).toBe('+0.51%');
        expect(result[1].changePct).toBe('-0.52%');
    });

    it('returns N/A when observation value is "."', async () => {
        global.fetch = vi.fn().mockImplementation((url: string) => {
            if (url.includes('SP500')) {
                return Promise.resolve({ ok: true, json: async () => ({ observations: [{ date: '2026-02-28', value: '.' }] }) });
            }
            return Promise.resolve({ ok: true, json: async () => makeFredResponse('100', '99', '2026-02-28', '2026-02-27') });
        });

        const { getMarketQuotes } = await import('../markets');
        const result = await getMarketQuotes('test-api-key');

        expect(result[0].price).toBe('N/A');
        expect(result[1].price).not.toBe('N/A');
    });

    it('returns fallback when FRED API returns error', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

        const { getMarketQuotes } = await import('../markets');
        const result = await getMarketQuotes('test-api-key');

        expect(result).toHaveLength(3);
        result.forEach(q => expect(q.price).toBe('N/A'));
    });
});
