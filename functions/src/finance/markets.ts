import * as logger from "firebase-functions/logger";

const FRED_BASE_URL = "https://api.stlouisfed.org/fred";

export interface MarketQuote {
    symbol: string;
    name: string;
    price: string;
    change: string;
    changePct: string;
    updatedAt: string;
}

interface CacheEntry {
    data: MarketQuote[];
    fetchedAt: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const INDEX_SERIES: { seriesId: string; name: string }[] = [
    { seriesId: "SP500", name: "S&P 500" },
    { seriesId: "NASDAQCOM", name: "NASDAQ" },
    { seriesId: "DJIA", name: "Dow Jones" },
];

export async function getMarketQuotes(apiKey: string): Promise<MarketQuote[]> {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        logger.info("Returning cached market data");
        return cache.data;
    }

    logger.info("Fetching market index data from FRED...");

    const results = await Promise.all(INDEX_SERIES.map(async ({ seriesId, name }) => {
        try {
            const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`FRED API returned status: ${response.status} for ${seriesId}`);
            }

            const data = await response.json();
            const observations = data.observations;

            if (!observations || observations.length === 0) {
                throw new Error(`No observations for ${seriesId}`);
            }

            const latest = observations[0];
            const previous = observations.length > 1 ? observations[1] : null;

            const latestVal = latest.value === "." ? null : parseFloat(latest.value);
            if (latestVal === null) {
                return fallback(seriesId, name);
            }

            let change = "0.00";
            let changePct = "0.00%";
            if (previous && previous.value !== ".") {
                const prevVal = parseFloat(previous.value);
                if (prevVal !== 0) {
                    const diff = latestVal - prevVal;
                    const pct = (diff / prevVal) * 100;
                    change = diff.toFixed(2);
                    changePct = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
                }
            }

            return {
                symbol: seriesId,
                name,
                price: latestVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                change,
                changePct,
                updatedAt: latest.date,
            };
        } catch (error) {
            logger.error(`Error fetching FRED series ${seriesId}:`, error);
            return fallback(seriesId, name);
        }
    }));

    const hasFailure = results.some(q => q.price === "N/A");
    if (!hasFailure || !cache) {
        cache = { data: results, fetchedAt: Date.now() };
    }
    return results;
}

function fallback(symbol: string, name: string): MarketQuote {
    return {
        symbol,
        name,
        price: "N/A",
        change: "0.00",
        changePct: "0.00%",
        updatedAt: new Date().toISOString(),
    };
}
