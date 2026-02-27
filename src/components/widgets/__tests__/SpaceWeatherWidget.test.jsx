import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SpaceWeatherWidget from '../SpaceWeatherWidget';

// Mock the global fetch
global.fetch = vi.fn();

describe('SpaceWeatherWidget', () => {
    it('renders the widget title', () => {
        render(<SpaceWeatherWidget />);
        expect(screen.getByText(/Space Weather/i)).toBeInTheDocument();
    });
});
