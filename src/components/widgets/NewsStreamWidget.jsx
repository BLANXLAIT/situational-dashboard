import React, { useState, useEffect } from 'react';
import WidgetContainer from './WidgetContainer';
import './NewsStreamWidget.css';

export default function NewsStreamWidget({ onRemove }) {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchNews() {
            try {
                const response = await fetch('/api/alerts/intelligence');

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                setNews(data.stream);
            } catch (e) {
                console.error("Failed to fetch intelligence stream.", e);
                setError("Unable to connect to Global Intelligence Feed.");
            } finally {
                setLoading(false);
            }
        }

        fetchNews();
        // Refresh every 10 minutes (HN changes slower than earthquake alerts)
        const interval = setInterval(fetchNews, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetContainer
            title="Intelligence Stream"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>}
            color="#8b5cf6" /* Purple accent for AI */
            onRemove={onRemove}
        >
            <div className="news-stream flex-column gap-md">
                {loading ? (
                    <div className="loading-state" style={{ color: 'var(--text-secondary)' }}>Intercepting and decoding signals...</div>
                ) : error ? (
                    <div className="error-state" style={{ color: 'var(--color-danger)' }}>{error}</div>
                ) : news.length === 0 ? (
                    <div className="empty-state">No significant intelligence events detected.</div>
                ) : (
                    news.map(item => (
                        <div key={item.id} className="news-card">
                            <div className="news-meta">
                                <span className="news-domain">{item.domain}</span>
                                <span className="news-time">{item.time}</span>
                            </div>
                            <h4 className="news-title">{item.title}</h4>
                            <p className="news-summary">{item.summary}</p>
                            <div className="news-footer">
                                <span className="news-source">{item.source}</span>
                                <div className="news-score-badge">
                                    Insight {item.score}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </WidgetContainer>
    );
}
