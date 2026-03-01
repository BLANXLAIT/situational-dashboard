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
