import React, { useState, useEffect } from 'react';
import WidgetContainer from './WidgetContainer';
import './GeopoliticalWidget.css';

function formatGdeltDate(seendate) {
    if (!seendate) return '';
    const year = seendate.slice(0, 4);
    const month = seendate.slice(4, 6);
    const day = seendate.slice(6, 8);
    const hour = seendate.slice(9, 11);
    const minute = seendate.slice(11, 13);
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`);
    if (isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    if (diffHrs < 1) return `${Math.floor(diffMs / 60000)} mins ago`;
    if (diffHrs < 24) return `${diffHrs} hrs ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
}

export default function GeopoliticalWidget({ onRemove }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchArticles() {
            try {
                const response = await fetch('/api/alerts/geopolitical');
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                const data = await response.json();
                setArticles(data.articles || []);
                setError(null);
            } catch (e) {
                console.error("Failed to fetch geopolitical news.", e);
                setError("Unable to connect to Geopolitical News Feed.");
            } finally {
                setLoading(false);
            }
        }

        fetchArticles();
        const interval = setInterval(fetchArticles, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetContainer
            title="Geopolitical News"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
            color="#ef4444"
            onRemove={onRemove}
        >
            <div className="geopolitical-stream flex-column gap-md">
                {loading ? (
                    <div className="loading-state" style={{ color: 'var(--text-secondary)' }}>Monitoring geopolitical signals...</div>
                ) : error ? (
                    <div className="error-state" style={{ color: 'var(--color-danger)' }}>{error}</div>
                ) : articles.length === 0 ? (
                    <div className="empty-state">No significant geopolitical events detected.</div>
                ) : (
                    articles.map((article, idx) => (
                        <a
                            key={`${article.domain}-${idx}`}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="geopolitical-card-link"
                        >
                            <div className="geopolitical-card">
                                <div className="geopolitical-meta">
                                    <span className="geopolitical-domain">{article.domain}</span>
                                    <span className="geopolitical-time">{formatGdeltDate(article.seendate)}</span>
                                </div>
                                <h4 className="geopolitical-title">
                                    {article.title}
                                    <svg className="geopolitical-external-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                        <polyline points="15 3 21 3 21 9"/>
                                        <line x1="10" y1="14" x2="21" y2="3"/>
                                    </svg>
                                </h4>
                                <div className="geopolitical-footer">
                                    <span className="geopolitical-country">{article.sourcecountry}</span>
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </WidgetContainer>
    );
}
