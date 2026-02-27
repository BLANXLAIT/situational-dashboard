import React from 'react';
import WidgetContainer from './WidgetContainer';
import './GeoWidget.css';

const ALERTS = [
    { id: 1, type: 'Earthquake', severity: 'high', title: 'M 6.4 - 12km NNE of Hualien City, Taiwan', time: '10 mins ago', desc: 'Tsunami warning issued for coastal regions. Expected impact minimal.' },
    { id: 2, type: 'Weather', severity: 'medium', title: 'Severe Thunderstorm Warning', time: '1 hr ago', desc: 'Expected hail and wind gusts up to 60mph. Travel disruptions likely.' },
    { id: 3, type: 'Volcano', severity: 'low', title: 'Mt. Etna Activity Increasing', time: '4 hrs ago', desc: 'Ash emissions detected, aviation code yellow. Monitoring ongoing.' }
];

export default function GeoWidget({ onRemove }) {
    return (
        <WidgetContainer
            title="Geologic & Climate"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>}
            color="var(--color-warning)"
            onRemove={onRemove}
        >
            <div className="geo-alerts-list">
                {ALERTS.map(alert => (
                    <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
                        <div className="alert-header">
                            <span className="alert-type">
                                <span className="dot"></span> {alert.type}
                            </span>
                            <span className="alert-time">{alert.time}</span>
                        </div>
                        <h4 className="alert-title">{alert.title}</h4>
                        <p className="alert-desc">{alert.desc}</p>
                    </div>
                ))}
            </div>
        </WidgetContainer>
    );
}
