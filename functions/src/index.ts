import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
import { getSignificantEarthquakes } from "./geology/usgs";
import { getTopTechNews } from "./intelligence/hackernews";
import { getSpaceWeatherAlerts } from "./geology/spaceweather";
import { getGdacsDisasters } from "./disasters/gdacs";
import { getMacroEconomicData } from "./finance/fred";
import { getCommodityPrices } from "./finance/commodities";
import { getOutbreakAlerts, getInfluenzaTrends } from "./health/diseases";
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

// Endpoint to fetch commodity prices from FRED
export const getCommodityData = onRequest({
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    secrets: ["FRED_API_KEY"]
}, async (request, response) => {
    logger.info("Fetching commodity prices from FRED...");
    const apiKey = process.env.FRED_API_KEY;

    if (!apiKey) {
        logger.error("FRED_API_KEY is not set in environment");
        response.status(500).json({ error: "API Key not configured" });
        return;
    }

    try {
        const commodities = await getCommodityPrices(apiKey);
        response.json({ commodities });
    } catch (error) {
        logger.error("Error fetching commodity data:", error);
        response.status(500).json({ error: "Failed to fetch commodity data" });
    }
});

// Endpoint to fetch outbreak alerts from WHO
export const getHealthAlerts = onRequest({ cors: ALLOWED_ORIGINS, invoker: "public" }, async (request, response) => {
    logger.info("Fetching outbreak alerts from disease.sh...");
    try {
        const alerts = await getOutbreakAlerts();
        response.json({ alerts });
    } catch (error) {
        logger.error("Error fetching outbreak alerts:", error);
        response.status(500).json({ error: "Failed to fetch outbreak alerts" });
    }
});

// Endpoint to fetch influenza trend data from disease.sh
export const getInfluenzaData = onRequest({ cors: ALLOWED_ORIGINS, invoker: "public" }, async (request, response) => {
    logger.info("Fetching influenza trends from disease.sh...");
    try {
        const trends = await getInfluenzaTrends();
        response.json({ trends });
    } catch (error) {
        logger.error("Error fetching influenza data:", error);
        response.status(500).json({ error: "Failed to fetch influenza data" });
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
 * Cached in Firestore with a 12-hour TTL to avoid redundant Gemini calls.
 * Pass ?force=true to bypass cache and regenerate.
 */
const NARRATIVE_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export const getSituationNarrative = onRequest({
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    secrets: ["FRED_API_KEY", "GEMINI_API_KEY"],
}, async (request, response) => {
    logger.info("Situation narrative requested...");
    try {
        const fredKey = process.env.FRED_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        if (!fredKey || !geminiKey) {
            throw new Error("Missing required API keys in Secret Manager.");
        }

        const forceRefresh = request.query.force === "true";
        const db = getFirestore();
        const cacheRef = db.collection("cache").doc("situation_narrative");

        // Check cache unless force refresh
        if (!forceRefresh) {
            const cached = await cacheRef.get();
            if (cached.exists) {
                const data = cached.data()!;
                const age = Date.now() - data.generatedAt;
                if (age < NARRATIVE_CACHE_TTL_MS) {
                    logger.info(`Serving cached narrative (age: ${Math.round(age / 60000)}min)`);
                    response.json({
                        narrative: data.narrative,
                        timestamp: data.timestamp,
                        cached: true,
                        cacheAge: Math.round(age / 60000),
                    });
                    return;
                }
            }
        }

        // Generate fresh narrative
        logger.info("Generating fresh narrative via Gemini...");
        const context = await aggregateGlobalState(fredKey);
        const narrative = await generateNarrative(geminiKey, context);

        // Cache the result
        await cacheRef.set({
            narrative,
            timestamp: context.timestamp,
            generatedAt: Date.now(),
        });

        response.json({ narrative, timestamp: context.timestamp, cached: false });
    } catch (e) {
        logger.error("Situation Narrative failed:", e);
        response.status(500).json({ error: (e as Error).message });
    }
});
