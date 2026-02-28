import React, { useState, useEffect } from 'react';
import WidgetContainer from './WidgetContainer';
import './GeoWidget.css';

export default function GeoWidget({ onRemove, size }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                // Fetch from our local Vite dev server which will be proxied to the Functions emulator,
                // or in production, relative to the Firebase Hosting domain.
                // Wait, for local dev without firebase hosting emulator, Vite needs a proxy setup.
                // Let's configure vite proxy or just use the full firebase emulator URL if in dev.
                // Actually, easiest is to hit the emulator directly if running in dev, or local Vite proxy.
                const isDev = import.meta.env.DEV;
                // In Vite, proxying is best set in vite.config.js
                const response = await fetch('/api/alerts/geology');

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                setAlerts(data.alerts);
            } catch (e) {
                console.error("Failed to fetch geologic alerts.", e);
                setError("Unable to connect to Geologic Intelligence Feed. Retrying soon...");
            } finally {
                setLoading(false);
            }
        }

        fetchAlerts();
        // Refresh every 5 minutes
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetContainer
            title="Geologic & Climate"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>}
            color="var(--color-warning)"
            onRemove={onRemove}
            size={size}
        >
            <div className="geo-alerts-list">
                {loading ? (
                    <div className="loading-state">Syncing satellite telemetry...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : alerts.length === 0 ? (
                    <div className="empty-state">No significant global alerts.</div>
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
