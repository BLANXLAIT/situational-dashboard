import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FinanceWidget from '../FinanceWidget';

const mockMarkets = [
    { symbol: 'SPX', name: 'S&P 500', price: '5280.10', change: '25.40', changePct: '+0.48%', updatedAt: '2024-01-15' },
    { symbol: 'IXIC', name: 'NASDAQ', price: '16400.25', change: '-30.00', changePct: '-0.18%', updatedAt: '2024-01-15' },
    { symbol: 'DJI', name: 'Dow Jones', price: '38500.00', change: '100.00', changePct: '+0.26%', updatedAt: '2024-01-15' },
    { symbol: 'VIX', name: 'VIX', price: '14.20', change: '-0.50', changePct: '-3.40%', updatedAt: '2024-01-15' },
];

describe('FinanceWidget', () => {
    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ markets: mockMarkets }),
        });
    });

    it('renders the widget title', () => {
        render(<FinanceWidget />);
        expect(screen.getByText(/Global Markets/i)).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
        render(<FinanceWidget />);
        expect(screen.getByText(/Loading market data/i)).toBeInTheDocument();
    });

    it('renders market cards after data loads', async () => {
        render(<FinanceWidget />);
        expect(await screen.findByText('S&P 500')).toBeInTheDocument();
        expect(screen.getByText('NASDAQ')).toBeInTheDocument();
        expect(screen.getByText('Dow Jones')).toBeInTheDocument();
        expect(screen.getByText('VIX')).toBeInTheDocument();
    });

    it('displays price and change for each market', async () => {
        render(<FinanceWidget />);
        expect(await screen.findByText('5280.10')).toBeInTheDocument();
        expect(screen.getByText('+0.48%')).toBeInTheDocument();
        expect(screen.getByText('-0.18%')).toBeInTheDocument();
    });

    it('shows error state when fetch fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false });
        render(<FinanceWidget />);
        expect(await screen.findByText(/Failed to fetch market data/i)).toBeInTheDocument();
    });
});
