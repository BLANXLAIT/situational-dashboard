import * as logger from "firebase-functions/logger";

// GDACS event type codes → human-readable labels
const EVENT_TYPE_LABELS: Record<string, string> = {
    EQ: "Earthquake",
    TC: "Tropical Cyclone",
    FL: "Flood",
    VO: "Volcano",
    WF: "Wildfire",
    DR: "Drought",
};

// Map GDACS alertlevel string → lowercase key used on the frontend
function normalizeAlertLevel(level: string): "green" | "orange" | "red" {
    switch (level?.toLowerCase()) {
        case "red": return "red";
        case "orange": return "orange";
        default: return "green";
    }
}

export interface GdacsAlert {
    id: string;
    type: string;          // e.g. "Earthquake", "Tropical Cyclone"
    eventCode: string;     // raw GDACS code, e.g. "EQ", "TC"
    alertLevel: "green" | "orange" | "red";
    title: string;
    country: string;
    severity: string;      // human text, e.g. "Magnitude 7.7M, Depth:10km"
    time: string;          // formatted date string
    timestamp: string;     // ISO 8601
    lat: number | null;
    lng: number | null;
    reportUrl: string;     // link to GDACS report page
}

export async function getGdacsDisasters(): Promise<GdacsAlert[]> {
    logger.info("Fetching global disaster data from GDACS API...");

    // Fetch all alert levels — frontend handles client-side filtering
    const url =
        "https://www.gdacs.org/gdacsapi/api/Events/geteventlist/SEARCH" +
        "?alertlevel=Red%2COrange%2CGreen&limit=50&outputformat=json";

    const response = await fetch(url, {
        headers: {
            "Accept": "application/json",
            "User-Agent": "SAAM-Dashboard/1.0",
        },
    });

    if (!response.ok) {
        throw new Error(`GDACS API returned status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || !Array.isArray(data.features)) {
        throw new Error("Unexpected GDACS response format: missing features array");
    }

    const alerts: GdacsAlert[] = data.features.map((feature: any) => {
        const p = feature.properties;

        const date = new Date(p.fromdate);
        const timeString = isNaN(date.getTime())
            ? p.fromdate
            : date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });

        const coords = feature.geometry?.coordinates;

        return {
            id: `gdacs-${p.eventtype}-${p.eventid}`,
            type: EVENT_TYPE_LABELS[p.eventtype] ?? p.eventtype,
            eventCode: p.eventtype,
            alertLevel: normalizeAlertLevel(p.alertlevel),
            title: p.name || p.description,
            country: p.country || "Unknown",
            severity: p.severitydata?.severitytext || "",
            time: timeString,
            timestamp: date.toISOString(),
            lat: coords?.[1] ?? null,
            lng: coords?.[0] ?? null,
            reportUrl: p.url?.report || `https://www.gdacs.org/report.aspx?eventid=${p.eventid}&eventtype=${p.eventtype}`,
        };
    });

    logger.info(`GDACS: fetched ${alerts.length} events`);
    return alerts;
}
