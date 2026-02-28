import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './Sidebar';
import FinanceWidget from './widgets/FinanceWidget';
import ForexWidget from './widgets/ForexWidget';
import GeoWidget from './widgets/GeoWidget';
import NewsStreamWidget from './widgets/NewsStreamWidget';
import SpaceWeatherWidget from './widgets/SpaceWeatherWidget';
import GdacsWidget from './widgets/GdacsWidget';
import MacroWidget from './widgets/MacroWidget';
import AnalystWidget from './widgets/AnalystWidget';
import CommoditiesWidget from './widgets/CommoditiesWidget';
import HealthAlertsWidget from './widgets/HealthAlertsWidget';
import InfluenzaTrendWidget from './widgets/InfluenzaTrendWidget';
import './Dashboard.css';

const ThreatGlobe = lazy(() => import('./globe/ThreatGlobe'));

const AVAILABLE_WIDGETS = [
    { id: 'finance', label: 'Global Markets', component: FinanceWidget, domain: 'Finance' },
    { id: 'forex', label: 'Foreign Exchange', component: ForexWidget, domain: 'Finance' },
    { id: 'geo', label: 'Geologic & Climate', component: GeoWidget, domain: 'Geology', size: 'compact' },
    { id: 'space', label: 'Space Weather', component: SpaceWeatherWidget, domain: 'Space Weather', size: 'compact' },
    { id: 'news', label: 'Intelligence Stream', component: NewsStreamWidget, domain: 'Tech & AI' },
    { id: 'gdacs', label: 'Global Disasters', component: GdacsWidget, domain: 'Geology' },
    { id: 'macro', label: 'Macro Economic', component: MacroWidget, domain: 'Finance' },
    { id: 'commodities', label: 'Commodity Prices', component: CommoditiesWidget, domain: 'Finance' },
    { id: 'analyst', label: 'AI Analyst', component: AnalystWidget, domain: 'Intelligence' },
    { id: 'healthAlerts', label: 'WHO Outbreak News', component: HealthAlertsWidget, domain: 'Health' },
    { id: 'influenza', label: 'Influenza Trends', component: InfluenzaTrendWidget, domain: 'Health', size: 'compact' },
];

const DEFAULT_LAYOUT = ['analyst', 'finance', 'news', 'geo', 'space', 'healthAlerts', 'commodities'];

export default function Dashboard({ activeDomain, sidebarOpen, setSidebarOpen, theme, toggleTheme }) {
    const [activeWidgets, setActiveWidgets] = useState(() => {
        const saved = localStorage.getItem('saam_widgets');
        return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('saam_widgets', JSON.stringify(activeWidgets));
    }, [activeWidgets]);

    // Cleanup dropdown on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setDropdownOpen(false);
                setSidebarOpen(false);
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [setSidebarOpen]);

    const removeWidget = (id) => {
        setActiveWidgets(prev => prev.filter(wId => wId !== id));
    };

    const addWidget = (id) => {
        if (!activeWidgets.includes(id)) {
            setActiveWidgets(prev => [...prev, id]);
        }
        setDropdownOpen(false);
    };

    const visibleWidgets = activeWidgets.filter(wId => {
        if (activeDomain === 'All') return true;
        const widgetDef = AVAILABLE_WIDGETS.find(w => w.id === wId);
        return widgetDef && widgetDef.domain === activeDomain;
    });

    const availableToAdd = AVAILABLE_WIDGETS.filter(w => !activeWidgets.includes(w.id));

    return (
        <>
            <header className="dashboard-header">
                <div className="header-left">
                    {/* Hamburger — mobile only */}
                    <button
                        className="glass-btn icon-btn hamburger-btn"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <div>
                        <h1>Situational Awareness</h1>
                        <p className="subtitle">Real-time global intelligence monitor</p>
                    </div>
                </div>
                <div className="header-actions">

                    <div className="dropdown">
                        <button
                            className="glass-btn"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            <span className="btn-label">Add Widget</span>
                        </button>

                        {dropdownOpen && (
                            <div className="dropdown-menu glass-panel">
                                {availableToAdd.length > 0 ? (
                                    availableToAdd.map(w => (
                                        <button key={w.id} onClick={() => addWidget(w.id)} className="dropdown-item">
                                            Add {w.label}
                                        </button>
                                    ))
                                ) : (
                                    <div className="dropdown-empty">All tracking established</div>
                                )}
                            </div>
                        )}
                    </div>

                    <button className="glass-btn icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                        {theme === 'dark' ? (
                            /* Sun icon for dark mode (switch to light) */
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        ) : (
                            /* Moon icon for light mode (switch to dark) */
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        )}
                    </button>

                    <button className="glass-btn icon-btn" title="Settings">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    </button>

                </div>
            </header>

            <Suspense fallback={<div className="glass-panel" style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderRadius: 'var(--radius-xl)' }}>Loading globe...</div>}>
                <ThreatGlobe />
            </Suspense>

            <div className="widget-grid">
                {visibleWidgets.length === 0 ? (
                    <div className="glass-panel empty-widget-slot">
                        <p>Filter applied: No widgets active for {activeDomain} segment.</p>
                    </div>
                ) : (
                    visibleWidgets.map(wId => {
                        const widgetDef = AVAILABLE_WIDGETS.find(w => w.id === wId);
                        const WidgetComponent = widgetDef.component;
                        return <WidgetComponent key={wId} onRemove={() => removeWidget(wId)} size={widgetDef.size || 'standard'} />;
                    })
                )}
            </div>
        </>
    );
}
