import * as logger from "firebase-functions/logger";

const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com";

export interface ForexRate {
    pair: string;
    base: string;
    quote: string;
    rate: string;
    change: string;
    changePct: string;
    updatedAt: string;
}

interface CacheEntry {
    data: ForexRate[];
    fetchedAt: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const FOREX_PAIRS: { symbol: string; base: string; quote: string }[] = [
    { symbol: "EUR/USD", base: "EUR", quote: "USD" },
    { symbol: "GBP/USD", base: "GBP", quote: "USD" },
    { symbol: "USD/JPY", base: "USD", quote: "JPY" },
    { symbol: "USD/CHF", base: "USD", quote: "CHF" },
    { symbol: "AUD/USD", base: "AUD", quote: "USD" },
    { symbol: "USD/CAD", base: "USD", quote: "CAD" },
    { symbol: "USD/BRL", base: "USD", quote: "BRL" },
    { symbol: "USD/MXN", base: "USD", quote: "MXN" },
    { symbol: "USD/INR", base: "USD", quote: "INR" },
];

export async function getForexRates(apiKey: string): Promise<ForexRate[]> {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        logger.info("Returning cached forex data");
        return cache.data;
    }

    logger.info("Fetching forex rates from Twelve Data...");

    const symbols = FOREX_PAIRS.map((p) => p.symbol).join(",");
    const url = `${TWELVE_DATA_BASE_URL}/quote?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Twelve Data API returned status: ${response.status}`);
    }

    const data = await response.json();

    const results: ForexRate[] = FOREX_PAIRS.map(({ symbol, base, quote }) => {
        // Batch responses are keyed by symbol; single-symbol responses are the object itself
        const pairData = FOREX_PAIRS.length === 1 ? data : data[symbol];

        if (!pairData || pairData.status === "error" || !pairData.close) {
            return {
                pair: symbol,
                base,
                quote,
                rate: "N/A",
                change: "0.0000",
                changePct: "0.00%",
                updatedAt: new Date().toISOString(),
            };
        }

        const changePctNum = parseFloat(pairData.percent_change ?? "0");
        const isPositive = changePctNum >= 0;

        return {
            pair: symbol,
            base,
            quote,
            rate: parseFloat(pairData.close).toFixed(4),
            change: parseFloat(pairData.change ?? "0").toFixed(4),
            changePct: `${isPositive ? "+" : ""}${changePctNum.toFixed(2)}%`,
            updatedAt: pairData.datetime ?? new Date().toISOString(),
        };
    });

    cache = { data: results, fetchedAt: Date.now() };
    return results;
}
