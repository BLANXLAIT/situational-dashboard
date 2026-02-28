import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ForexWidget from '../ForexWidget';

const mockRates = [
    { pair: 'EUR/USD', base: 'EUR', quote: 'USD', rate: '1.0850', change: '0.0012', changePct: '+0.11%', updatedAt: '2024-01-15' },
    { pair: 'GBP/USD', base: 'GBP', quote: 'USD', rate: '1.2710', change: '-0.0030', changePct: '-0.24%', updatedAt: '2024-01-15' },
    { pair: 'USD/JPY', base: 'USD', quote: 'JPY', rate: '148.5200', change: '0.3500', changePct: '+0.24%', updatedAt: '2024-01-15' },
];

describe('ForexWidget', () => {
    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ rates: mockRates }),
        });
    });

    it('renders the widget title', () => {
        render(<ForexWidget />);
        expect(screen.getByText(/Foreign Exchange/i)).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
        render(<ForexWidget />);
        expect(screen.getByText(/Loading forex rates/i)).toBeInTheDocument();
    });

    it('renders currency pair cards after data loads', async () => {
        render(<ForexWidget />);
        expect(await screen.findByText('EUR/USD')).toBeInTheDocument();
        expect(screen.getByText('GBP/USD')).toBeInTheDocument();
        expect(screen.getByText('USD/JPY')).toBeInTheDocument();
    });

    it('displays rate and percent change for each pair', async () => {
        render(<ForexWidget />);
        expect(await screen.findByText('1.0850')).toBeInTheDocument();
        expect(screen.getByText('+0.11%')).toBeInTheDocument();
        expect(screen.getByText('-0.24%')).toBeInTheDocument();
    });

    it('shows error state when fetch fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false });
        render(<ForexWidget />);
        expect(await screen.findByText(/Failed to fetch forex rates/i)).toBeInTheDocument();
    });
});
