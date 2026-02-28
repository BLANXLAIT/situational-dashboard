import React, { useState, useEffect } from 'react';
import WidgetContainer from './WidgetContainer';
import './GeoWidget.css'; // Reusing GeoWidget styles for consistency

export default function SpaceWeatherWidget({ onRemove, size }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                const response = await fetch('/api/alerts/space');
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                const data = await response.json();
                setAlerts(data.alerts);
            } catch (e) {
                console.error("Failed to fetch space weather alerts.", e);
                setError("Unable to connect to NOAA telemetry stream.");
            } finally {
                setLoading(false);
            }
        }

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 15 * 60 * 1000); // 15 min refresh
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetContainer
            title="Space Weather"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2v20" /><path d="M2 12h20" /><path d="m4.93 4.93 14.14 14.14" /><path d="m4.93 19.07 14.14-14.14" /></svg>}
            color="var(--color-primary)"
            onRemove={onRemove}
            size={size}
        >
            <div className="geo-alerts-list">
                {loading ? (
                    <div className="loading-state">Scanning ionosphere...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : alerts.length === 0 ? (
                    <div className="empty-state">No significant solar activity detected.</div>
                ) : (
                    alerts.map(alert => (
                        <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
                            <div className="alert-header">
                                <span className="alert-type">
                                    <span className="dot"></span> {alert.type}
                                </span>
                                <span className="alert-time">{alert.time}</span>
                            </div>
                            <h4 className="alert-title">{alert.title}</h4>
                            <p className="alert-desc">{alert.desc}</p>
                        </div>
                    ))
                )}
            </div>
        </WidgetContainer>
    );
}
