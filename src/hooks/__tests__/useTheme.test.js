import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

// Mock matchMedia
const mockMatchMedia = (prefersDark) => {
    return vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
};

describe('useTheme', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
        window.matchMedia = mockMatchMedia(true); // default to dark system preference
    });

    afterEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    it('defaults to system preference (dark) when no localStorage value', () => {
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('defaults to system preference (light) when no localStorage value and system is light', () => {
        window.matchMedia = mockMatchMedia(false);
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe('light');
    });

    it('restores persisted theme from localStorage', () => {
        localStorage.setItem('saam_theme', 'light');
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe('light');
    });

    it('toggleTheme switches from dark to light and persists', () => {
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe('dark');

        act(() => result.current.toggleTheme());

        expect(result.current.theme).toBe('light');
        expect(localStorage.getItem('saam_theme')).toBe('light');
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('toggleTheme switches from light to dark and persists', () => {
        localStorage.setItem('saam_theme', 'light');
        const { result } = renderHook(() => useTheme());

        act(() => result.current.toggleTheme());

        expect(result.current.theme).toBe('dark');
        expect(localStorage.getItem('saam_theme')).toBe('dark');
    });

    it('applies data-theme attribute to documentElement', () => {
        const { result } = renderHook(() => useTheme());
        expect(document.documentElement.getAttribute('data-theme')).toBe(result.current.theme);
    });
});
