import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock firebase-functions/logger to avoid initialization errors in tests
vi.mock('firebase-functions/logger', () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
}));

describe('getMarketQuotes', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns market data parsed from Twelve Data batch response', async () => {
        const mockResponse = {
            SPX: { close: '5280.10', change: '25.40', percent_change: '0.48384', datetime: '2024-01-15' },
            IXIC: { close: '16400.25', change: '-30.00', percent_change: '-0.18291', datetime: '2024-01-15' },
            DJI: { close: '38500.00', change: '100.00', percent_change: '0.26042', datetime: '2024-01-15' },
            VIX: { close: '14.20', change: '-0.50', percent_change: '-3.40136', datetime: '2024-01-15' },
        };

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const { getMarketQuotes } = await import('../markets');
        const result = await getMarketQuotes('test-api-key');

        expect(result).toHaveLength(4);
        expect(result[0].symbol).toBe('SPX');
        expect(result[0].name).toBe('S&P 500');
        expect(result[0].price).toBe('5280.10');
        expect(result[0].changePct).toBe('+0.48%');
        expect(result[1].changePct).toBe('-0.18%');
    });

    it('returns N/A for symbols with error status', async () => {
        const mockResponse = {
            SPX: { status: 'error', message: 'symbol not found' },
            IXIC: { close: '16400.25', change: '-30.00', percent_change: '-0.18291', datetime: '2024-01-15' },
            DJI: { close: '38500.00', change: '100.00', percent_change: '0.26042', datetime: '2024-01-15' },
            VIX: { close: '14.20', change: '-0.50', percent_change: '-3.40136', datetime: '2024-01-15' },
        };

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const { getMarketQuotes } = await import('../markets');
        const result = await getMarketQuotes('test-api-key');

        expect(result[0].price).toBe('N/A');
        expect(result[1].price).toBe('16400.25');
    });

    it('throws an error when the API returns a non-ok status', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 429 });

        const { getMarketQuotes } = await import('../markets');
        await expect(getMarketQuotes('test-api-key')).rejects.toThrow('Twelve Data API returned status: 429');
    });
});
