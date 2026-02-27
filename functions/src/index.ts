import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getSignificantEarthquakes } from "./geology/usgs";
import { getTopTechNews } from "./intelligence/hackernews";
import { getSpaceWeatherAlerts } from "./geology/spaceweather";

// Set strict CORS policy to prevent unauthorized web clients from draining quotas
const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://saam-dashboard-1772190712.web.app",
    "https://saam-dashboard-1772190712.firebaseapp.com"
];

// Endpoint to fetch live alerts from USGS
export const getGeologicAlerts = onRequest({ cors: ALLOWED_ORIGINS, invoker: "public" }, async (request, response) => {
    logger.info("Fetching geologic alerts from USGS...");
    try {
        const alerts = await getSignificantEarthquakes();
        response.json({ alerts });
    } catch (error) {
        logger.error("Error fetching geologic alerts:", error);
        response.status(500).json({ error: "Failed to fetch alerts" });
    }
});

// Endpoint to fetch live tech news from Hacker News
export const getIntelligenceStream = onRequest({ cors: ALLOWED_ORIGINS, invoker: "public" }, async (request, response) => {
    logger.info("Fetching intelligence stream from Hacker News...");
    try {
        const stream = await getTopTechNews();
        response.json({ stream });
    } catch (error) {
        logger.error("Error fetching intelligence stream:", error);
        response.status(500).json({ error: "Failed to fetch top news" });
    }
});

// Endpoint to fetch live Space Weather alerts from NOAA
export const getSpaceWeather = onRequest({ cors: ALLOWED_ORIGINS, invoker: "public" }, async (request, response) => {
    logger.info("Fetching space weather alerts from NOAA...");
    try {
        const alerts = await getSpaceWeatherAlerts();
        response.json({ alerts });
    } catch (error) {
        logger.error("Error fetching space weather alerts:", error);
        response.status(500).json({ error: "Failed to fetch space weather" });
    }
});
