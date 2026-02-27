import React, { useState, useEffect } from 'react';
import WidgetContainer from './WidgetContainer';
import './MacroWidget.css';

export default function MacroWidget({ onRemove }) {
    const [indicators, setIndicators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMacroData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/macro');
                if (!response.ok) {
                    throw new Error('Failed to fetch economic data');
                }
                const data = await response.json();
                setIndicators(data.indicators);
                setError(null);
            } catch (err) {
                console.error('Error fetching FRED data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMacroData();
        // Economic data doesn't change fast, refresh once an hour
        const interval = setInterval(fetchMacroData, 3600000);
        return () => clearInterval(interval);
    }, []);

    const renderSparkline = (history, color) => {
        if (!history || history.length < 2) return null;

        const values = history.map(h => h.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        const width = 100;
        const height = 30;

        const points = values.map((val, i) => {
            const x = (i / (values.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="macro-sparkline">
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
            </svg>
        );
    };

    return (
        <WidgetContainer
            title="Macro Economic Monitor"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>}
            color="#3b82f6"
            onRemove={onRemove}
        >
            {loading && !indicators.length ? (
                <div className="widget-loading">Loading market indicators...</div>
            ) : error ? (
                <div className="widget-error">{error}</div>
            ) : (
                <div className="macro-grid">
                    {indicators.map((indicator) => {
                        const isPositive = indicator.changePct.startsWith('+');
                        // For unemployment, positive change is usually "bad" (red), 
                        // but for GDP it's "good" (green).
                        // Let's keep it simple: green for up, red for down for now.
                        const colorClass = isPositive ? 'positive' : 'negative';
                        const sparkColor = isPositive ? 'var(--color-success)' : 'var(--color-error)';

                        return (
                            <div key={indicator.id} className="macro-card">
                                <span className="macro-label">{indicator.title}</span>
                                <div className="macro-main">
                                    <span className="macro-value">{indicator.value}</span>
                                    <span className={`macro-change ${colorClass}`}>
                                        {indicator.changePct}
                                    </span>
                                </div>
                                <div className="macro-sparkline-container">
                                    {renderSparkline(indicator.history, sparkColor)}
                                </div>
                                <span className="macro-date">{indicator.date}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </WidgetContainer>
    );
}
