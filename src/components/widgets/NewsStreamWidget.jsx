import React from 'react';
import WidgetContainer from './WidgetContainer';
import './NewsStreamWidget.css';

const NEWS_ITEMS = [
    { id: 1, source: 'AI Summary', domain: 'Tech & AI', title: 'AGI Timelines Revised', summary: 'Multiple research labs report unexpected breakthroughs in self-improving reasoning models. Hardware constraints remain the primary bottleneck.', time: 'Just now', score: 98 },
    { id: 2, source: 'Geopolitics', domain: 'Global Relations', title: 'New Trade Agreement in SEA', summary: 'Five Southeast Asian nations sign semiconductor trade pact, attempting to bypass existing embargoes. Markets reacting to potential supply chain shifts.', time: '35 mins ago', score: 85 },
    { id: 3, source: 'Business', domain: 'Finance', title: 'Central Bank Rate Decision', summary: 'Interest rates held steady; forward guidance suggests easing in Q3. Equity markets reacting positively across the board.', time: '2 hrs ago', score: 92 },
];

export default function NewsStreamWidget({ onRemove }) {
    return (
        <WidgetContainer
            title="Intelligence Stream"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>}
            color="#8b5cf6" /* Purple accent for AI */
            onRemove={onRemove}
        >
            <div className="news-stream flex-column gap-md">
                {NEWS_ITEMS.map(item => (
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
                ))}
            </div>
        </WidgetContainer>
    );
}
