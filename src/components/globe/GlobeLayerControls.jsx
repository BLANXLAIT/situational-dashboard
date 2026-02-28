import React from 'react';
import { LAYER_COLORS, LAYER_LABELS } from './globeConfig';

export default function GlobeLayerControls({ layers, onToggle, eventCounts }) {
    return (
        <div className="globe-layer-controls">
            {Object.keys(LAYER_LABELS).map(key => (
                <button
                    key={key}
                    className={`globe-layer-pill ${layers[key] ? 'active' : ''}`}
                    onClick={() => onToggle(key)}
                    style={{
                        '--pill-color': LAYER_COLORS[key],
                    }}
                >
                    <span
                        className="pill-dot"
                        style={{ backgroundColor: layers[key] ? LAYER_COLORS[key] : 'var(--text-muted)' }}
                    />
                    {LAYER_LABELS[key]}
                    {eventCounts[key] > 0 && (
                        <span className="pill-badge">{eventCounts[key]}</span>
                    )}
                </button>
            ))}
        </div>
    );
}
