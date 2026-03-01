import React, { useState, useEffect } from 'react';
import WidgetContainer from './WidgetContainer';
import './FinanceWidget.css';

export default function FinanceWidget({ onRemove }) {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/markets');
                if (!response.ok) throw new Error('Failed to fetch market data');
                const data = await response.json();
                setMarkets(data.markets);
                setLastUpdated(new Date().toLocaleTimeString());
                setError(null);
            } catch (err) {
                console.error('Error fetching market data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMarkets();
        // Refresh every 15 minutes to align with backend cache TTL
        const interval = setInterval(fetchMarkets, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetContainer
            title="Global Markets"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>}
            color="var(--color-success)"
            onRemove={onRemove}
        >
            {loading && !markets.length ? (
                <div className="widget-loading">Loading market data...</div>
            ) : error ? (
                <div className="widget-error">{error}</div>
            ) : (
                <>
                    <div className="finance-grid">
                        {markets.map(market => {
                            const isUp = market.changePct.startsWith('+');
                            return (
                                <div key={market.symbol} className="market-card">
                                    <span className="market-symbol">{market.name}</span>
                                    <div className="market-data">
                                        <span className="market-value">{market.price}</span>
                                        <span className={`market-change ${isUp ? 'up' : 'down'}`}>
                                            {market.changePct}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {lastUpdated && (
                        <div className="finance-footer">
                            <span className="finance-delayed">Delayed 15 min · Updated {lastUpdated}</span>
                        </div>
                    )}
                </>
            )}
        </WidgetContainer>
    );
}

