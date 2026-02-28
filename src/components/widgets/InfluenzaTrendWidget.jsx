import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import WidgetContainer from './WidgetContainer';
import './InfluenzaTrendWidget.css';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="ili-tooltip">
            <p className="ili-tooltip-label">Week {label}</p>
            <p className="ili-tooltip-value">{payload[0].value.toFixed(2)}% weighted ILI</p>
        </div>
    );
};

export default function InfluenzaTrendWidget({ onRemove, size }) {
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTrends() {
            try {
                const response = await fetch('/api/health/influenza');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                setTrends(data.trends);
            } catch (e) {
                console.error("Failed to fetch influenza trends.", e);
                setError("Unable to connect to Influenza Trend Feed.");
            } finally {
                setLoading(false);
            }
        }

        fetchTrends();
        const interval = setInterval(fetchTrends, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetContainer
            title="Influenza Trends (ILI)"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>}
            color="var(--color-accent)"
            onRemove={onRemove}
            size={size}
        >
            <div className="ili-chart-container">
                {loading ? (
                    <div className="loading-state">Syncing CDC telemetry...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : trends.length === 0 ? (
                    <div className="empty-state">No influenza trend data available.</div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={trends} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                                dataKey="week"
                                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                tickLine={false}
                                unit="%"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="percentWeightedILI"
                                stroke="var(--color-accent)"
                                strokeWidth={2}
                                dot={{ r: 3, fill: 'var(--color-accent)' }}
                                activeDot={{ r: 5, stroke: 'var(--color-accent)', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </WidgetContainer>
    );
}
