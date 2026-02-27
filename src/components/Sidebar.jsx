import React from 'react';
import './Sidebar.css';

const DOMAINS = [
    { id: 'All', icon: 'M4 6h16M4 12h16M4 18h7' },
    { id: 'Finance', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { id: 'Geopolitics', icon: 'M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' },
    { id: 'Geology', icon: 'M2 22l10-10 4 4 6-16' },
    { id: 'Tech & AI', icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83' }
];

export default function Sidebar({ activeView, setActiveView, activeDomain, setActiveDomain, isOpen, onClose }) {
    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
            )}

            <aside className={`sidebar glass-panel${isOpen ? ' sidebar-open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="logo-icon"></div>
                    <h2>S.A.A.M.</h2>
                    {/* Close button — visible on mobile only */}
                    <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="sidebar-section">
                    <nav className="sidebar-nav">
                        <button
                            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                            onClick={() => { setActiveView('dashboard'); onClose(); }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
                                <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            Dashboard
                        </button>
                        <button
                            className={`nav-item ${activeView === 'sources' ? 'active' : ''}`}
                            onClick={() => { setActiveView('sources'); onClose(); }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Data Sources
                        </button>
                        <button
                            className={`nav-item ${activeView === 'aiconfig' ? 'active' : ''}`}
                            onClick={() => { setActiveView('aiconfig'); onClose(); }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
                                <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22"></path><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93"></path><path d="M8.56 13a8 8 0 0 0-2.3 3.5"></path><path d="M15.44 13a8 8 0 0 1 2.3 3.5"></path>
                            </svg>
                            AI Configuration
                        </button>
                    </nav>
                </div>

                <div className="sidebar-section">
                    <p className="section-label">FILTER BY DOMAIN</p>
                    <nav className="sidebar-nav">
                        {DOMAINS.map(domain => (
                            <button
                                key={domain.id}
                                className={`nav-item ${activeDomain === domain.id ? 'active' : ''}`}
                                disabled={activeView !== 'dashboard'}
                                style={{ opacity: activeView !== 'dashboard' ? 0.4 : 1, cursor: activeView !== 'dashboard' ? 'not-allowed' : 'pointer' }}
                                onClick={() => { setActiveDomain(domain.id); onClose(); }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
                                    <path d={domain.icon}></path>
                                </svg>
                                {domain.id}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="sidebar-footer">
                    <button className="nav-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        Settings
                    </button>
                </div>
            </aside>
        </>
    );
}
