import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getSignificantEarthquakes } from "./geology/usgs";
import { getTopTechNews } from "./intelligence/hackernews";
import { getSpaceWeatherAlerts } from "./geology/spaceweather";
import { getGdacsDisasters } from "./disasters/gdacs";
import { getMacroEconomicData } from "./finance/fred";
import { aggregateGlobalState } from "./analyst/consolidator";
import { generateNarrative, ANALYST_CONFIG } from "./analyst/gemini";

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

// Endpoint to fetch global disaster alerts from GDACS
export const getGdacsAlerts = onRequest({ cors: ALLOWED_ORIGINS, invoker: "public" }, async (request, response) => {
    logger.info("Fetching global disaster alerts from GDACS...");
    try {
        const alerts = await getGdacsDisasters();
        response.json({ alerts });
    } catch (error) {
        logger.error("Error fetching GDACS alerts:", error);
        response.status(500).json({ error: "Failed to fetch GDACS alerts" });
    }
});

// Test endpoint to verify connectivity
export const testPing = onRequest({ cors: ALLOWED_ORIGINS, invoker: "public" }, (request, response) => {
    response.send("pong");
});

// Endpoint to fetch macro economic data from FRED
export const getMacroData = onRequest({
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    secrets: ["FRED_API_KEY"]
}, async (request, response) => {
    logger.info("Fetching macro economic data from FRED...");
    const apiKey = process.env.FRED_API_KEY;

    if (!apiKey) {
        logger.error("FRED_API_KEY is not set in environment");
        response.status(500).json({ error: "API Key not configured" });
        return;
    }

    try {
        const data = await getMacroEconomicData(apiKey);
        response.json({ indicators: data });
    } catch (error) {
        logger.error("Error fetching macro data:", error);
        response.status(500).json({ error: "Failed to fetch macro data" });
    }
});

// Endpoint to return current AI analyst configuration
export const getAnalystConfig = onRequest({ cors: ALLOWED_ORIGINS, invoker: "public" }, (request, response) => {
    response.json(ANALYST_CONFIG);
});

/**
 * AI-powered Situation Narrative
 * Aggregates data from all modules and uses Gemini to synthesize a narrative.
 */
export const getSituationNarrative = onRequest({
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    secrets: ["FRED_API_KEY", "GEMINI_API_KEY"],
}, async (request, response) => {
    logger.info("Generating global situation narrative...");
    try {
        const fredKey = process.env.FRED_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        if (!fredKey || !geminiKey) {
            throw new Error("Missing required API keys in Secret Manager.");
        }

        const context = await aggregateGlobalState(fredKey);
        const narrative = await generateNarrative(geminiKey, context);

        response.json({ narrative, timestamp: context.timestamp });
    } catch (e) {
        logger.error("Situation Narrative failed:", e);
        response.status(500).json({ error: (e as Error).message });
    }
});
