import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import WidgetContainer from './WidgetContainer';
import './CommoditiesWidget.css';

export default function CommoditiesWidget({ onRemove }) {
    const [commodities, setCommodities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/commodities');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                setCommodities(data.commodities);
                setError(null);
            } catch (err) {
                console.error('Error fetching commodity data:', err);
                setError('Unable to connect to Commodity Feed.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetContainer
            title="Commodity Prices"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"></path><path d="m4.93 4.93 14.14 14.14"></path><path d="m4.93 19.07 14.14-14.14"></path></svg>}
            color="#f59e0b"
            onRemove={onRemove}
        >
            {loading ? (
                <div className="loading-state">Syncing commodity telemetry...</div>
            ) : error ? (
                <div className="error-state">{error}</div>
            ) : (
                <div className="commodity-grid">
                    {commodities.map((c) => {
                        const isPositive = c.changePct.startsWith('+');
                        const changeColor = isPositive ? 'var(--color-success)' : 'var(--color-danger)';

                        return (
                            <div key={c.id} className="commodity-card">
                                <div className="commodity-header">
                                    <span className="commodity-label">{c.title}</span>
                                    <span className="commodity-unit">{c.unit}</span>
                                </div>
                                <div className="commodity-main">
                                    <span className="commodity-value">{c.prefix}{c.value}</span>
                                    <span
                                        className={`commodity-change ${isPositive ? 'positive' : 'negative'}`}
                                    >
                                        {c.changePct}
                                    </span>
                                </div>
                                {c.history.length >= 2 && (
                                    <div className="commodity-sparkline">
                                        <ResponsiveContainer width="100%" height={36}>
                                            <AreaChart data={c.history}>
                                                <defs>
                                                    <linearGradient id={`grad-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor={changeColor} stopOpacity={0.3} />
                                                        <stop offset="100%" stopColor={changeColor} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <YAxis domain={['dataMin', 'dataMax']} hide />
                                                <Area
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke={changeColor}
                                                    strokeWidth={1.5}
                                                    fill={`url(#grad-${c.id})`}
                                                    dot={false}
                                                    isAnimationActive={false}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                <span className="commodity-date">{c.date}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </WidgetContainer>
    );
}
