import * as logger from "firebase-functions/logger";

const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com";

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
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const MARKET_SYMBOLS: { symbol: string; name: string }[] = [
    { symbol: "SPX", name: "S&P 500" },
    { symbol: "IXIC", name: "NASDAQ" },
    { symbol: "DJI", name: "Dow Jones" },
    { symbol: "VIX", name: "VIX" },
];

export async function getMarketQuotes(apiKey: string): Promise<MarketQuote[]> {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        logger.info("Returning cached market data");
        return cache.data;
    }

    logger.info("Fetching market quotes from Twelve Data...");

    const symbols = MARKET_SYMBOLS.map((m) => m.symbol).join(",");
    const url = `${TWELVE_DATA_BASE_URL}/quote?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Twelve Data API returned status: ${response.status}`);
    }

    const data = await response.json();

    const results: MarketQuote[] = MARKET_SYMBOLS.map(({ symbol, name }) => {
        // Batch responses are keyed by symbol; single-symbol responses are the object itself
        const quote = MARKET_SYMBOLS.length === 1 ? data : data[symbol];

        if (!quote || quote.status === "error" || !quote.close) {
            return {
                symbol,
                name,
                price: "N/A",
                change: "0.00",
                changePct: "0.00%",
                updatedAt: new Date().toISOString(),
            };
        }

        const changePctNum = parseFloat(quote.percent_change ?? "0");
        const isPositive = changePctNum >= 0;

        return {
            symbol,
            name,
            price: parseFloat(quote.close).toFixed(2),
            change: parseFloat(quote.change ?? "0").toFixed(2),
            changePct: `${isPositive ? "+" : ""}${changePctNum.toFixed(2)}%`,
            updatedAt: quote.datetime ?? new Date().toISOString(),
        };
    });

    cache = { data: results, fetchedAt: Date.now() };
    return results;
}
