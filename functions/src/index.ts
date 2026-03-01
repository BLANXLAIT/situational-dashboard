import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
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
import { getMarketQuotes } from "./finance/markets";
import { getForexRates as fetchForexRates } from "./finance/forex";
import { getOutbreakAlerts, getInfluenzaTrends } from "./health/diseases";
import { aggregateGlobalState } from "./analyst/consolidator";
import { generateNarrative, ANALYST_CONFIG } from "./analyst/gemini";
import { aggregateGlobeData } from "./globe/aggregator";
import { getGeopoliticalNews as fetchGeopoliticalNews } from "./intelligence/gdelt";

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

// Endpoint to fetch aggregated globe event data
export const getGlobeEvents = onRequest({ cors: ALLOWED_ORIGINS, invoker: "public", timeoutSeconds: 120 }, async (request, response) => {
    logger.info("Fetching aggregated globe events...");
    try {
        const events = await aggregateGlobeData();
        response.json({ events });
    } catch (error) {
        logger.error("Error fetching globe events:", error);
        response.status(500).json({ error: "Failed to fetch globe events" });
    }
});

// Endpoint to fetch geopolitical news from GDELT
export const getGeopoliticalNews = onRequest({
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    timeoutSeconds: 120
}, async (request, response) => {
    logger.info("Fetching geopolitical news from GDELT...");
    try {
        const articles = await fetchGeopoliticalNews();
        response.json({ articles });
    } catch (error) {
        logger.error("Error fetching geopolitical news:", error);
        response.status(500).json({ error: "Failed to fetch geopolitical news" });
    }
});

// Test endpoint to verify connectivity
export const testPing = onRequest({ cors: ALLOWED_ORIGINS, invoker: "public" }, (request, response) => {
    response.send("pong");
});

// Endpoint to fetch real-time market quotes (S&P 500, NASDAQ, etc.) from Twelve Data
export const getMarketData = onRequest({
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    secrets: ["TWELVE_DATA_API_KEY"],
    timeoutSeconds: 120
}, async (request, response) => {
    logger.info("Fetching market quotes from Twelve Data...");
    const apiKey = process.env.TWELVE_DATA_API_KEY;

    if (!apiKey) {
        logger.error("TWELVE_DATA_API_KEY is not set in environment");
        response.status(500).json({ error: "API Key not configured" });
        return;
    }

    try {
        const markets = await getMarketQuotes(apiKey);
        response.json({ markets });
    } catch (error) {
        logger.error("Error fetching market data:", error);
        response.status(500).json({ error: "Failed to fetch market data" });
    }
});

// Endpoint to fetch foreign exchange rates from Twelve Data
export const getForexRates = onRequest({
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    secrets: ["TWELVE_DATA_API_KEY"],
    timeoutSeconds: 120
}, async (request, response) => {
    logger.info("Fetching forex rates from Twelve Data...");
    const apiKey = process.env.TWELVE_DATA_API_KEY;

    if (!apiKey) {
        logger.error("TWELVE_DATA_API_KEY is not set in environment");
        response.status(500).json({ error: "API Key not configured" });
        return;
    }

    try {
        const rates = await fetchForexRates(apiKey);
        response.json({ rates });
    } catch (error) {
        logger.error("Error fetching forex rates:", error);
        response.status(500).json({ error: "Failed to fetch forex rates" });
    }
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
 * Scheduled narrative generator — runs every 12 hours.
 * Aggregates all data sources, calls Gemini, writes result to Firestore.
 * Fully decoupled from the HTTP endpoint so users never wait for Gemini.
 */
export const generateSituationNarrative = onSchedule({
    schedule: "every 12 hours",
    timeoutSeconds: 300,
    secrets: ["FRED_API_KEY", "GEMINI_API_KEY"],
}, async () => {
    logger.info("Scheduled narrative generation starting...");
    try {
        const fredKey = process.env.FRED_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        if (!fredKey || !geminiKey) {
            throw new Error("Missing required API keys in Secret Manager.");
        }

        const context = await aggregateGlobalState(fredKey);
        const narrative = await generateNarrative(geminiKey, context);

        const db = getFirestore();
        await db.collection("cache").doc("situation_narrative").set({
            narrative,
            timestamp: context.timestamp,
            generatedAt: Date.now(),
        });

        logger.info("Narrative generated and cached successfully.");
    } catch (e) {
        logger.error("Scheduled narrative generation failed:", e);
    }
});

/**
 * HTTP endpoint — serves the cached narrative from Firestore.
 * Pass ?force=true to trigger an immediate regeneration.
 */
export const getSituationNarrative = onRequest({
    cors: ALLOWED_ORIGINS,
    invoker: "public",
    timeoutSeconds: 300,
    secrets: ["FRED_API_KEY", "GEMINI_API_KEY"],
}, async (request, response) => {
    try {
        const db = getFirestore();
        const cacheRef = db.collection("cache").doc("situation_narrative");

        // Force refresh: regenerate inline (for manual refresh button)
        if (request.query.force === "true") {
            const fredKey = process.env.FRED_API_KEY;
            const geminiKey = process.env.GEMINI_API_KEY;

            if (!fredKey || !geminiKey) {
                throw new Error("Missing required API keys in Secret Manager.");
            }

            logger.info("Force-refreshing narrative via Gemini...");
            const context = await aggregateGlobalState(fredKey);
            const narrative = await generateNarrative(geminiKey, context);

            await cacheRef.set({
                narrative,
                timestamp: context.timestamp,
                generatedAt: Date.now(),
            });

            response.json({ narrative, timestamp: context.timestamp, cached: false });
            return;
        }

        // Normal path: serve from cache
        const cached = await cacheRef.get();
        if (cached.exists) {
            const data = cached.data()!;
            const ageMin = Math.round((Date.now() - data.generatedAt) / 60000);
            response.json({
                narrative: data.narrative,
                timestamp: data.timestamp,
                cached: true,
                cacheAge: ageMin,
            });
            return;
        }

        response.json({ narrative: null, timestamp: null, cached: false, pending: true });
    } catch (e) {
        logger.error("Situation Narrative read failed:", e);
        response.status(500).json({ error: (e as Error).message });
    }
});
