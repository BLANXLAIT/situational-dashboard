import React from 'react';
import WidgetContainer from './WidgetContainer';
import './FinanceWidget.css';

const MOCK_MARKETS = [
    { symbol: 'S&P 500', value: '5,123.41', change: '+1.24%', up: true },
    { symbol: 'NASDAQ', value: '16,234.12', change: '+1.51%', up: true },
    { symbol: 'VIX', value: '13.45', change: '-4.20%', up: false },
    { symbol: 'Crude Oil', value: '$82.40', change: '+0.85%', up: true },
    { symbol: 'Gold', value: '$2,341.10', change: '+0.42%', up: true },
    { symbol: 'US 10Y Bearer', value: '4.21%', change: '-0.03%', up: false },
];

export default function FinanceWidget({ onRemove }) {
    return (
        <WidgetContainer
            title="Global Markets"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>}
            color="var(--color-success)"
            onRemove={onRemove}
        >
            <div className="finance-grid">
                {MOCK_MARKETS.map(market => (
                    <div key={market.symbol} className="market-card">
                        <span className="market-symbol">{market.symbol}</span>
                        <div className="market-data">
                            <span className="market-value">{market.value}</span>
                            <span className={`market-change ${market.up ? 'up' : 'down'}`}>
                                {market.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="finance-chart-container">
                <div className="chart-header">
                    <span>SPX Intraday</span>
                    <span className="live-indicator">
                        <span className="pulse-dot"></span> LIVE
                    </span>
                </div>
                <div className="chart-mock">
                    {/* SVG Mock line chart */}
                    <svg viewBox="0 0 300 100" className="mock-sparkline">
                        <path d="M0 80 Q 20 70, 40 75 T 80 50 T 120 60 T 160 30 T 200 40 T 240 20 T 300 10"
                            fill="none" stroke="var(--color-success)" strokeWidth="3" strokeLinecap="round" />
                        <path d="M0 80 Q 20 70, 40 75 T 80 50 T 120 60 T 160 30 T 200 40 T 240 20 T 300 10 L 300 100 L 0 100 Z"
                            fill="url(#gradient-success)" opacity="0.2" />
                        <defs>
                            <linearGradient id="gradient-success" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--color-success)" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        </WidgetContainer>
    );
}
