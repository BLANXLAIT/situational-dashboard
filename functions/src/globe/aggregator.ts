import * as logger from "firebase-functions/logger";
import { getSignificantEarthquakes } from "../geology/usgs";
import { getGdacsDisasters } from "../disasters/gdacs";
import { getSpaceWeatherAlerts } from "../geology/spaceweather";
import { getOutbreakAlerts } from "../health/diseases";
import { COUNTRY_CENTROIDS } from "./countryCentroids";

export interface GlobeEvent {
    id: string;
    source: "usgs" | "gdacs" | "noaa" | "who";
    type: string;
    lat: number;
    lng: number;
    severity: number; // 0-1 normalized
    title: string;
    detail: string;
    time: string; // ISO 8601
    isGlobal: boolean;
}

function settle<T>(promise: Promise<T>, label: string): Promise<T | null> {
    return promise.catch((e) => {
        logger.warn(`Globe data source "${label}" failed, skipping:`, e);
        return null;
    });
}

function normalizeSeverity(level: string): number {
    switch (level) {
        case "high": return 0.9;
        case "medium": return 0.6;
        case "low": return 0.3;
        default: return 0.3;
    }
}

function gdacsAlertToSeverity(level: "green" | "orange" | "red"): number {
    switch (level) {
        case "red": return 0.9;
        case "orange": return 0.6;
        case "green": return 0.3;
    }
}

function tryParseCountryFromTitle(title: string): { lat: number; lng: number } | null {
    for (const [country, coords] of Object.entries(COUNTRY_CENTROIDS)) {
        if (title.includes(country)) return coords;
    }
    return null;
}

export async function aggregateGlobeData(): Promise<GlobeEvent[]> {
    const [earthquakes, disasters, spaceWeather, outbreaks] = await Promise.all([
        settle(getSignificantEarthquakes(), "usgs"),
        settle(getGdacsDisasters(), "gdacs"),
        settle(getSpaceWeatherAlerts(), "noaa"),
        settle(getOutbreakAlerts(), "who"),
    ]);

    const events: GlobeEvent[] = [];

    // USGS earthquakes — have native lat/lng via the enhanced response
    if (earthquakes) {
        for (const eq of earthquakes) {
            if (eq.lat != null && eq.lng != null) {
                events.push({
                    id: eq.id,
                    source: "usgs",
                    type: "Earthquake",
                    lat: eq.lat,
                    lng: eq.lng,
                    severity: normalizeSeverity(eq.severity),
                    title: eq.title,
                    detail: eq.desc,
                    time: eq.timestamp,
                    isGlobal: false,
                });
            }
        }
    }

    // GDACS disasters — have native lat/lng via the enhanced response
    if (disasters) {
        for (const d of disasters) {
            if (d.lat != null && d.lng != null) {
                events.push({
                    id: d.id,
                    source: "gdacs",
                    type: d.type,
                    lat: d.lat,
                    lng: d.lng,
                    severity: gdacsAlertToSeverity(d.alertLevel),
                    title: d.title,
                    detail: `${d.severity} — ${d.country}`,
                    time: d.timestamp,
                    isGlobal: false,
                });
            }
        }
    }

    // Space weather — global effect, no specific coordinates
    if (spaceWeather) {
        for (const sw of spaceWeather) {
            events.push({
                id: sw.id,
                source: "noaa",
                type: sw.type,
                lat: 0,
                lng: 0,
                severity: normalizeSeverity(sw.severity),
                title: sw.title,
                detail: sw.desc,
                time: sw.timestamp,
                isGlobal: true,
            });
        }
    }

    // WHO outbreaks — map country name from title to centroid
    if (outbreaks) {
        for (const ob of outbreaks) {
            const coords = tryParseCountryFromTitle(ob.title);
            if (coords) {
                events.push({
                    id: ob.id,
                    source: "who",
                    type: "Health Outbreak",
                    lat: coords.lat,
                    lng: coords.lng,
                    severity: normalizeSeverity(ob.severity),
                    title: ob.title,
                    detail: ob.summary,
                    time: ob.date,
                    isGlobal: false,
                });
            }
        }
    }

    logger.info(`Globe aggregator: ${events.length} events collected`);
    return events;
}
