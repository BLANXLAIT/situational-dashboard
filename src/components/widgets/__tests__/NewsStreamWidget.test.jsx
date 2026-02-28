import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewsStreamWidget from '../NewsStreamWidget';

const mockStream = [
    {
        id: 1,
        source: 'Hacker News',
        domain: 'Tech & AI',
        title: 'Test Article with Link',
        url: 'https://example.com/article',
        summary: '',
        time: '2 hrs ago',
        score: 100,
    },
    {
        id: 2,
        source: 'Hacker News',
        domain: 'Tech & AI',
        title: 'Ask HN: No External Link',
        url: null,
        summary: '',
        time: '5 hrs ago',
        score: 50,
    },
];

describe('NewsStreamWidget', () => {
    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ stream: mockStream }),
        });
    });

    it('renders the widget title', () => {
        render(<NewsStreamWidget />);
        expect(screen.getByText(/Intelligence Stream/i)).toBeInTheDocument();
    });

    it('renders news items as clickable links when a URL is present', async () => {
        render(<NewsStreamWidget />);
        const link = await screen.findByRole('link', { name: /Test Article with Link/i });
        expect(link).toHaveAttribute('href', 'https://example.com/article');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders items without a URL as non-linking elements', async () => {
        render(<NewsStreamWidget />);
        await screen.findByText('Ask HN: No External Link');
        const noUrlLink = screen.queryByRole('link', { name: /Ask HN: No External Link/i });
        expect(noUrlLink).toBeNull();
    });
});
