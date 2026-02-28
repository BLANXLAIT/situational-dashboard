import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Globe from 'react-globe.gl';
import useGlobeData from './useGlobeData';
import GlobeLayerControls from './GlobeLayerControls';
import GlobeEventPanel from './GlobeEventPanel';
import { LAYER_COLORS, markerSize, markerAltitude, isRecent } from './globeConfig';
import './ThreatGlobe.css';

export default function ThreatGlobe() {
    const globeRef = useRef();
    const containerRef = useRef();
    const { events, loading, error } = useGlobeData();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [hoveredEvent, setHoveredEvent] = useState(null);
    const [layers, setLayers] = useState({
        usgs: true,
        gdacs: true,
        noaa: true,
        who: true,
    });

    // Track container size
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setDimensions({ width, height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Slow auto-rotate, stop on interaction
    useEffect(() => {
        const globe = globeRef.current;
        if (!globe) return;
        const controls = globe.controls();
        if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.3;
            controls.enableZoom = true;
            controls.minDistance = 150;
            controls.maxDistance = 500;
        }
    }, []);

    const toggleLayer = useCallback((key) => {
        setLayers(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    // Filter events by active layers and exclude global events from point rendering
    const pointEvents = useMemo(() => {
        return events.filter(e => layers[e.source] && !e.isGlobal);
    }, [events, layers]);

    // Recent events get pulsing rings
    const ringEvents = useMemo(() => {
        return pointEvents.filter(e => isRecent(e.time));
    }, [pointEvents]);

    // Count events per source
    const eventCounts = useMemo(() => {
        const counts = { usgs: 0, gdacs: 0, noaa: 0, who: 0 };
        events.forEach(e => { if (counts[e.source] !== undefined) counts[e.source]++; });
        return counts;
    }, [events]);

    // Space weather atmosphere effect
    const spaceWeatherActive = useMemo(() => {
        if (!layers.noaa) return false;
        return events.some(e => e.source === 'noaa' && e.severity > 0.5);
    }, [events, layers.noaa]);

    const maxSpaceSeverity = useMemo(() => {
        if (!layers.noaa) return 0;
        return events
            .filter(e => e.source === 'noaa')
            .reduce((max, e) => Math.max(max, e.severity), 0);
    }, [events, layers.noaa]);

    return (
        <div className="threat-globe-container glass-panel" ref={containerRef}>
            <GlobeLayerControls
                layers={layers}
                onToggle={toggleLayer}
                eventCounts={eventCounts}
            />

            {loading && events.length === 0 && (
                <div className="globe-loading">Loading threat data...</div>
            )}
            {error && events.length === 0 && (
                <div className="globe-error">Failed to load: {error}</div>
            )}

            <div className="globe-wrapper">
                {dimensions.width > 0 && <Globe
                    ref={globeRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    globeImageUrl="/textures/earth-night.jpg"
                    backgroundColor="rgba(0,0,0,0)"
                    atmosphereColor={spaceWeatherActive ? '#6366f1' : '#3b82f6'}
                    atmosphereAltitude={0.15 + maxSpaceSeverity * 0.1}
                    showAtmosphere={true}
                    pointsData={pointEvents}
                    pointLat="lat"
                    pointLng="lng"
                    pointColor={d => LAYER_COLORS[d.source] || '#fff'}
                    pointRadius={d => markerSize(d.severity)}
                    pointAltitude={d => markerAltitude(d.severity)}
                    pointLabel={d => `
                        <div class="globe-tooltip">
                            <strong>${d.title}</strong>
                            <span>${d.type}</span>
                        </div>
                    `}
                    onPointClick={d => setSelectedEvent(d)}
                    onPointHover={d => setHoveredEvent(d)}
                    ringsData={ringEvents}
                    ringLat="lat"
                    ringLng="lng"
                    ringColor={d => [LAYER_COLORS[d.source] || '#fff']}
                    ringMaxRadius={3}
                    ringPropagationSpeed={1.5}
                    ringRepeatPeriod={1200}
                />}
            </div>

            <GlobeEventPanel
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />

            {hoveredEvent && !selectedEvent && (
                <div className="globe-hover-label">
                    {hoveredEvent.title}
                </div>
            )}
        </div>
    );
}
