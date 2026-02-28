import React from 'react';
import './WidgetContainer.css';

export default function WidgetContainer({ title, icon, color = 'var(--color-accent)', children, onRemove, size = 'standard' }) {
    return (
        <div className={`glass-panel widget-container${size === 'compact' ? ' widget-compact' : ''}`}>
            <div className="widget-header">
                <div className="widget-title" style={{ '--widget-color': color }}>
                    <div className="widget-icon">{icon}</div>
                    <h3>{title}</h3>
                </div>
                <div className="widget-actions">
                    {onRemove && (
                        <button className="widget-btn" onClick={onRemove} title="Remove Widget">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    )}
                </div>
            </div>
            <div className="widget-content">
                {children}
            </div>
        </div>
    );
}
