import React, { useState, useEffect } from 'react';
import './AIConfigPage.css';

export default function AIConfigPage({ setSidebarOpen }) {
    const [config, setConfig] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/analyst/config')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(setConfig)
            .catch(err => setError(err.message));
    }, []);

    if (error) {
        return (
            <div className="aiconfig-page">
                <div className="aiconfig-error">Failed to load config: {error}</div>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="aiconfig-page">
                <div className="aiconfig-loading">Loading AI configuration...</div>
            </div>
        );
    }

    return (
        <div className="aiconfig-page">
            <header className="aiconfig-header">
                <h1>AI Analysis Configuration</h1>
                <p>Current model and prompt configuration for the S.A.A.M. Intelligence Analyst.</p>
            </header>

            <div className="aiconfig-card">
                <h3>Model</h3>
                <span className="aiconfig-model-badge">{config.model}</span>
            </div>

            <div className="aiconfig-card">
                <h3>System Prompt</h3>
                <div className="aiconfig-prompt">{config.systemPrompt}</div>
            </div>

            <div className="aiconfig-card">
                <h3>Generation Parameters</h3>
                <div className="aiconfig-params-grid">
                    <div className="aiconfig-param">
                        <span className="param-label">Temperature</span>
                        <span className="param-value">{config.temperature}</span>
                    </div>
                    <div className="aiconfig-param">
                        <span className="param-label">Top P</span>
                        <span className="param-value">{config.topP}</span>
                    </div>
                    <div className="aiconfig-param">
                        <span className="param-label">Top K</span>
                        <span className="param-value">{config.topK}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
