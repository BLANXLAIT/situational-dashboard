import React, { useState, useEffect } from 'react';
import WidgetContainer from './WidgetContainer';
import './HealthAlertsWidget.css';

export default function HealthAlertsWidget({ onRemove }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                const response = await fetch('/api/health/alerts');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                setAlerts(data.alerts);
            } catch (e) {
                console.error("Failed to fetch health alerts.", e);
                setError("Unable to connect to WHO Disease Outbreak Feed.");
            } finally {
                setLoading(false);
            }
        }

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetContainer
            title="WHO Outbreak News"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"></path></svg>}
            color="var(--color-danger)"
            onRemove={onRemove}
        >
            <div className="health-alerts-list">
                {loading ? (
                    <div className="loading-state">Syncing WHO outbreak telemetry...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : alerts.length === 0 ? (
                    <div className="empty-state">No active outbreak reports.</div>
                ) : (
                    alerts.map((alert) => (
                        <a
                            key={alert.id}
                            className={`health-alert-card severity-${alert.severity}`}
                            href={alert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="health-alert-content">
                                <div className="health-alert-header">
                                    <span className="health-alert-severity">
                                        <span className="dot"></span>
                                    </span>
                                    <span className="health-alert-date">{alert.date}</span>
                                </div>
                                <h4 className="health-alert-title">{alert.title}</h4>
                                <p className="health-alert-summary">{alert.summary}</p>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </WidgetContainer>
    );
}
