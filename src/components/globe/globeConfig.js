export const LAYER_COLORS = {
    usgs: '#f59e0b',    // amber — earthquakes
    gdacs: '#ef4444',   // red — disasters
    noaa: '#3b82f6',    // blue — space weather
    who: '#10b981',     // green — health outbreaks
};

export const LAYER_LABELS = {
    usgs: 'Earthquakes',
    gdacs: 'Disasters',
    noaa: 'Space Weather',
    who: 'Health',
};

export const GLOBE_MATERIAL = {
    bumpScale: 10,
    showAtmosphere: true,
    atmosphereColor: '#3b82f6',
    atmosphereAltitude: 0.15,
};

// Marker size range (pixels at globe scale)
export const MARKER_SIZE_MIN = 0.4;
export const MARKER_SIZE_MAX = 1.8;

export function markerSize(severity) {
    return MARKER_SIZE_MIN + severity * (MARKER_SIZE_MAX - MARKER_SIZE_MIN);
}

export function markerAltitude(severity) {
    return 0.01 + severity * 0.04;
}

export function isRecent(isoTime) {
    if (!isoTime) return false;
    const eventTime = new Date(isoTime).getTime();
    const now = Date.now();
    return (now - eventTime) < 24 * 60 * 60 * 1000;
}
