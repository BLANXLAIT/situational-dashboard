import React, { useState, useEffect } from 'react';
import WidgetContainer from './WidgetContainer';
import './GdacsWidget.css';

const EVENT_ICONS = {
    EQ: '🌍',
    TC: '🌀',
    FL: '🌊',
    VO: '🌋',
    WF: '🔥',
    DR: '☀️',
};

const ALERT_LEVELS = [
    { key: 'red', label: 'Red', emoji: '🔴' },
    { key: 'orange', label: 'Orange', emoji: '🟠' },
    { key: 'green', label: 'Green', emoji: '🟢' },
];

export default function GdacsWidget({ onRemove }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeLevels, setActiveLevels] = useState(new Set(['red', 'orange', 'green']));

    useEffect(() => {
        async function fetchAlerts() {
            try {
                const response = await fetch('/api/alerts/gdacs');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                setAlerts(data.alerts);
            } catch (e) {
                console.error('Failed to fetch GDACS alerts.', e);
                setError('Unable to connect to GDACS Disaster Feed.');
            } finally {
                setLoading(false);
            }
        }

        fetchAlerts();
        // Refresh every 15 minutes — GDACS updates every 6 min but this is sufficient
        const interval = setInterval(fetchAlerts, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const toggleLevel = (level) => {
        setActiveLevels(prev => {
            const next = new Set(prev);
            if (next.has(level)) {
                // Don't allow deselecting all
                if (next.size > 1) next.delete(level);
            } else {
                next.add(level);
            }
            return next;
        });
    };

    const filtered = alerts.filter(a => activeLevels.has(a.alertLevel));

    const icon = (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
            <path d="M3.05 11a9 9 0 1 0 .5-3" />
        </svg>
    );

    return (
        <WidgetContainer title="Global Disaster Monitor" icon={icon} color="#ef4444" onRemove={onRemove}>
            {/* Alert level filter pills */}
            <div className="gdacs-filter-bar">
                <span className="gdacs-filter-label">ALERT LEVEL</span>
                <div className="gdacs-pills">
                    {ALERT_LEVELS.map(({ key, label, emoji }) => (
                        <button
                            key={key}
                            className={`level-pill level-pill--${key}${activeLevels.has(key) ? ' active' : ''}`}
                            onClick={() => toggleLevel(key)}
                        >
                            {emoji} {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="gdacs-alerts-list">
                {loading ? (
                    <div className="loading-state" style={{ color: 'var(--text-secondary)' }}>
                        Syncing global disaster telemetry...
                    </div>
                ) : error ? (
                    <div className="error-state" style={{ color: 'var(--color-danger)' }}>{error}</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state" style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>
                        No events match the selected alert levels.
                    </div>
                ) : (
                    filtered.map(alert => (
                        <div key={alert.id} className={`gdacs-card gdacs-${alert.alertLevel}`}>
                            <div className="gdacs-card-header">
                                <span className="gdacs-type-badge">
                                    {EVENT_ICONS[alert.eventCode] ?? '⚠️'} {alert.type}
                                </span>
                                <span className="gdacs-time">{alert.time}</span>
                            </div>
                            <p className="gdacs-title">{alert.title}</p>
                            {alert.severity && (
                                <p className="gdacs-severity">{alert.severity}</p>
                            )}
                            <div className="gdacs-footer">
                                <span className="gdacs-country">📍 {alert.country}</span>
                                <a
                                    className="gdacs-report-link"
                                    href={alert.reportUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Full Report ↗
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </WidgetContainer>
    );
}
