import { useState, useEffect } from 'react';

const STORAGE_KEY = 'saam_theme';

/**
 * useTheme — manages light/dark theme with:
 * - System preference detection via prefers-color-scheme
 * - Manual override persisted in localStorage
 * - Reactive system preference changes when no manual override is set
 * - Applies data-theme attribute to document.documentElement
 */
export function useTheme() {
    const [manualTheme, setManualTheme] = useState(
        () => localStorage.getItem(STORAGE_KEY)
    );
    const [systemTheme, setSystemTheme] = useState(
        () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );

    // Reactively follow system preference changes when no manual override is set
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                setSystemTheme(e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const theme = manualTheme || systemTheme;

    // Apply theme attribute to root element
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        setManualTheme(next);
    };

    return { theme, toggleTheme };
}
