import React from 'react';
import './DataSourcesPage.css';

const SOURCES = [
    {
        name: 'Macro Economic Monitor',
        provider: 'Federal Reserve (FRED)',
        url: 'https://fred.stlouisfed.org/',
        frequency: '60 Minutes',
        domain: 'Finance',
        description: 'U.S. economic indicators including Real GDP, Unemployment Rate, CPI, and Fed Funds Rate. FRED provides access to 840,000+ time series from 118 sources — one of the largest open economic datasets in the world.',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
    },
    {
        name: 'Global Disaster Monitor',
        provider: 'GDACS',
        url: 'https://www.gdacs.org/',
        frequency: '15 Minutes',
        domain: 'Geology',
        description: 'Real-time alerts for earthquakes, floods, tropical cyclones, and volcanoes. Provided by the Global Disaster Alert and Coordination System.',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
    },
    {
        name: 'Geologic & Climate',
        provider: 'USGS',
        url: 'https://earthquake.usgs.gov/',
        frequency: '5 Minutes',
        domain: 'Geology',
        description: 'Significant seismic activity monitoring worldwide. High-precision telemetry for earthquake magnitude and location.',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
    },
    {
        name: 'Intelligence Stream',
        provider: 'Hacker News API',
        url: 'https://github.com/HackerNews/API',
        frequency: '10 Minutes',
        domain: 'Tech & AI',
        description: 'Monitoring global tech trends and AI developments via the Y Combinator intelligence feed. Decodes signals from top-tier tech discourse.',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
    },
    {
        name: 'Space Weather',
        provider: 'NOAA (SWPC)',
        url: 'https://www.swpc.noaa.gov/',
        frequency: '15 Minutes',
        domain: 'Space Weather',
        description: 'Solar flares, geomagnetic storms, and ionospheric telemetry. Critical for satellite and telecommunications situational awareness.',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2v20" /><path d="M2 12h20" /><path d="m4.93 4.93 14.14 14.14" /><path d="m4.93 19.07 14.14-14.14" /></svg>
    },
    {
        name: 'Global Markets',
        provider: 'AlphaVantage (Mocked)',
        url: 'https://www.alphavantage.co/',
        frequency: '1 Minute',
        domain: 'Finance',
        description: 'Real-time pricing for major equity indices and commodities. Currently using simulation logic for demonstration.',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
    },
    {
        name: 'Commodity Prices',
        provider: 'Federal Reserve (FRED)',
        url: 'https://fred.stlouisfed.org/',
        frequency: '30 Minutes',
        domain: 'Finance',
        description: 'Commodity prices and indices including WTI/Brent crude oil, natural gas, US gasoline, US Dollar Index, and Small Arms Ammunition PPI. Sourced from FRED with 30-day sparkline history.',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" /><path d="m4.93 4.93 14.14 14.14" /><path d="m4.93 19.07 14.14-14.14" /></svg>
    },
    {
        name: 'WHO Outbreak News',
        provider: 'World Health Organization',
        url: 'https://www.who.int/emergencies/disease-outbreak-news',
        frequency: '15 Minutes',
        domain: 'Health',
        description: 'Official disease outbreak news from the WHO. Covers emerging pathogens including Mpox, Nipah, Marburg, avian influenza, and other high-priority events.',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" /></svg>
    },
    {
        name: 'Influenza Trends (ILINet)',
        provider: 'disease.sh (CDC)',
        url: 'https://disease.sh/',
        frequency: '30 Minutes',
        domain: 'Health',
        description: 'Weekly influenza-like illness (ILI) surveillance data from the CDC ILINet network. Tracks weighted ILI percentages across U.S. healthcare providers.',
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    }
];

export default function DataSourcesPage() {
    return (
        <div className="sources-page">
            <header className="sources-header">
                <h1>Intelligence Sources & Meta-data</h1>
                <p>Provenance and telemetry architecture for the S.A.A.M. dashboard.</p>
            </header>

            <div className="sources-grid">
                {SOURCES.map((source, i) => (
                    <div key={i} className="source-card">
                        <div className="source-card-header">
                            <div className="source-icon">
                                {source.icon}
                            </div>
                            <h3>{source.name}</h3>
                        </div>

                        <div className="source-details">
                            <div className="detail-item">
                                <span className="detail-label">Provider</span>
                                <span className="detail-value">{source.provider}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Update Frequency</span>
                                <span className="detail-value">{source.frequency}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Domain</span>
                                <span className="detail-value">{source.domain}</span>
                            </div>
                        </div>

                        <p className="source-description">{source.description}</p>

                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link">
                            View API Documentation
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
