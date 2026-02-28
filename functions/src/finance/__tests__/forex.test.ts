import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock firebase-functions/logger to avoid initialization errors in tests
vi.mock('firebase-functions/logger', () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
}));

describe('getForexRates', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns forex rates parsed from Twelve Data batch response', async () => {
        const mockResponse = {
            'EUR/USD': { close: '1.0850', change: '0.0012', percent_change: '0.11073', datetime: '2024-01-15' },
            'GBP/USD': { close: '1.2710', change: '-0.0030', percent_change: '-0.23548', datetime: '2024-01-15' },
            'USD/JPY': { close: '148.5200', change: '0.3500', percent_change: '0.23612', datetime: '2024-01-15' },
            'USD/CHF': { close: '0.8950', change: '-0.0010', percent_change: '-0.11161', datetime: '2024-01-15' },
            'AUD/USD': { close: '0.6590', change: '0.0005', percent_change: '0.07604', datetime: '2024-01-15' },
            'USD/CAD': { close: '1.3420', change: '0.0020', percent_change: '0.14934', datetime: '2024-01-15' },
            'USD/BRL': { close: '4.9500', change: '-0.0200', percent_change: '-0.40161', datetime: '2024-01-15' },
            'USD/MXN': { close: '17.1500', change: '0.0300', percent_change: '0.17513', datetime: '2024-01-15' },
            'USD/INR': { close: '83.0000', change: '0.1000', percent_change: '0.12063', datetime: '2024-01-15' },
        };

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const { getForexRates } = await import('../forex');
        const result = await getForexRates('test-api-key');

        expect(result).toHaveLength(9);
        expect(result[0].pair).toBe('EUR/USD');
        expect(result[0].base).toBe('EUR');
        expect(result[0].quote).toBe('USD');
        expect(result[0].rate).toBe('1.0850');
        expect(result[0].changePct).toBe('+0.11%');
        expect(result[1].changePct).toBe('-0.24%');
    });

    it('returns N/A for pairs with error status', async () => {
        const mockResponse = {
            'EUR/USD': { status: 'error', message: 'symbol not found' },
            'GBP/USD': { close: '1.2710', change: '-0.0030', percent_change: '-0.23548', datetime: '2024-01-15' },
            'USD/JPY': { close: '148.5200', change: '0.3500', percent_change: '0.23612', datetime: '2024-01-15' },
            'USD/CHF': { close: '0.8950', change: '-0.0010', percent_change: '-0.11161', datetime: '2024-01-15' },
            'AUD/USD': { close: '0.6590', change: '0.0005', percent_change: '0.07604', datetime: '2024-01-15' },
            'USD/CAD': { close: '1.3420', change: '0.0020', percent_change: '0.14934', datetime: '2024-01-15' },
            'USD/BRL': { close: '4.9500', change: '-0.0200', percent_change: '-0.40161', datetime: '2024-01-15' },
            'USD/MXN': { close: '17.1500', change: '0.0300', percent_change: '0.17513', datetime: '2024-01-15' },
            'USD/INR': { close: '83.0000', change: '0.1000', percent_change: '0.12063', datetime: '2024-01-15' },
        };

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const { getForexRates } = await import('../forex');
        const result = await getForexRates('test-api-key');

        expect(result[0].rate).toBe('N/A');
        expect(result[1].rate).toBe('1.2710');
    });

    it('throws an error when the API returns a non-ok status', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 429 });

        const { getForexRates } = await import('../forex');
        await expect(getForexRates('test-api-key')).rejects.toThrow('Twelve Data API returned status: 429');
    });
});
