import React from 'react';
import { LAYER_COLORS, LAYER_LABELS } from './globeConfig';

export default function GlobeEventPanel({ event, onClose }) {
    if (!event) return null;

    const color = LAYER_COLORS[event.source] || 'var(--color-accent)';
    const sourceLabel = LAYER_LABELS[event.source] || event.source;

    return (
        <div className="globe-event-panel glass-panel">
            <div className="event-panel-header">
                <span className="event-panel-source" style={{ color }}>
                    {sourceLabel}
                </span>
                <button className="event-panel-close" onClick={onClose} aria-label="Close">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
            <h3 className="event-panel-title">{event.title}</h3>
            <p className="event-panel-type">{event.type}</p>
            <p className="event-panel-detail">{event.detail}</p>
            {event.time && (
                <p className="event-panel-time">
                    {new Date(event.time).toLocaleString()}
                </p>
            )}
            <div className="event-panel-severity">
                <div
                    className="severity-bar"
                    style={{
                        width: `${Math.round(event.severity * 100)}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
        </div>
    );
}
