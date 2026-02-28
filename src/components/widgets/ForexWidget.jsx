import React, { useState, useEffect } from 'react';
import WidgetContainer from './WidgetContainer';
import './ForexWidget.css';

export default function ForexWidget({ onRemove }) {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/forex');
                if (!response.ok) throw new Error('Failed to fetch forex rates');
                const data = await response.json();
                setRates(data.rates);
                setLastUpdated(new Date().toLocaleTimeString());
                setError(null);
            } catch (err) {
                console.error('Error fetching forex rates:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
        // Refresh every 5 minutes to align with backend cache TTL
        const interval = setInterval(fetchRates, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetContainer
            title="Foreign Exchange"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}
            color="#8b5cf6"
            onRemove={onRemove}
        >
            {loading && !rates.length ? (
                <div className="widget-loading">Loading forex rates...</div>
            ) : error ? (
                <div className="widget-error">{error}</div>
            ) : (
                <>
                    <div className="forex-grid">
                        {rates.map(rate => {
                            const isUp = rate.changePct.startsWith('+');
                            return (
                                <div key={rate.pair} className="forex-card">
                                    <span className="forex-pair">{rate.pair}</span>
                                    <div className="forex-data">
                                        <span className="forex-rate">{rate.rate}</span>
                                        <span className={`forex-change ${isUp ? 'up' : 'down'}`}>
                                            {rate.changePct}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {lastUpdated && (
                        <div className="forex-footer">
                            <span className="forex-delayed">Delayed 15 min · Updated {lastUpdated}</span>
                        </div>
                    )}
                </>
            )}
        </WidgetContainer>
    );
}
