import React, { useState, useEffect } from 'react';
import './AnalystWidget.css';
import ReactMarkdown from 'react-markdown';

export default function AnalystWidget() {
    const [narrative, setNarrative] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const [cached, setCached] = useState(false);
    const [cacheAge, setCacheAge] = useState(null);

    const fetchNarrative = async (force = false) => {
        setLoading(true);
        setError(null);
        try {
            const url = force ? '/api/analyst/narrative?force=true' : '/api/analyst/narrative';
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Analyst service returned status: ${response.status}`);
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            if (data.pending) {
                setNarrative('');
                setError('Narrative generation is pending. The first analysis will appear within a few minutes.');
                return;
            }
            setNarrative(data.narrative);
            setLastUpdated(new Date(data.timestamp));
            setCached(!!data.cached);
            setCacheAge(data.cacheAge || null);
        } catch (e) {
            console.error("Analyst Narrative failed:", e);
            setError(`Analyst offline: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNarrative();
    }, []);

    return (
        <div className="analyst-widget glass-panel">
            <div className="analyst-header">
                <div className="analyst-title">
                    <div className="pulse-icon"></div>
                    <span className="analyst-badge">S.A.A.M. Analyst</span>
                    <h3>Global Situation Narrative</h3>
                </div>
                <button
                    className="refresh-btn"
                    onClick={() => fetchNarrative(true)}
                    disabled={loading}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
                    {loading ? 'Analyzing...' : 'Refresh Analysis'}
                </button>
            </div>

            <div className="analyst-content">
                {loading && !narrative ? (
                    <div className="analyst-loading">
                        <div className="spinner"></div>
                        <p>Synthesizing global telemetry streams and identifying correlations...</p>
                    </div>
                ) : error ? (
                    <div className="analyst-error">
                        {error}
                    </div>
                ) : (
                    <div className="analyst-narrative">
                        <ReactMarkdown>{narrative}</ReactMarkdown>
                    </div>
                )}
            </div>

            <div className="analyst-footer">
                <span>Classification: Unclassified // Open Source Intelligence</span>
                {lastUpdated && (
                    <span>
                        Last analysis: {lastUpdated.toLocaleTimeString()}
                        {cached && cacheAge != null && ` (cached ${cacheAge < 60 ? `${cacheAge}m` : `${Math.round(cacheAge / 60)}h`} ago)`}
                    </span>
                )}
            </div>
        </div>
    );
}
