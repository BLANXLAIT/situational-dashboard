import * as logger from "firebase-functions/logger";

const FRED_BASE_URL = "https://api.stlouisfed.org/fred";

const COMMODITY_SERIES: Record<string, { title: string; unit: string; prefix?: string }> = {
    DCOILWTICO: { title: "WTI Crude Oil", unit: "$/bbl", prefix: "$" },
    GOLDAMGBD228NLBM: { title: "Gold (London Fix)", unit: "$/oz", prefix: "$" },
    DCOILBRENTEU: { title: "Brent Crude", unit: "$/bbl", prefix: "$" },
    DHHNGSP: { title: "Natural Gas", unit: "$/MMBtu", prefix: "$" },
    DTWEXBGS: { title: "US Dollar Index", unit: "index" },
    GASREGW: { title: "US Gasoline", unit: "$/gal", prefix: "$" },
};

export async function getCommodityPrices(apiKey: string) {
    logger.info("Fetching commodity prices from FRED...");

    const seriesIds = Object.keys(COMMODITY_SERIES);

    const results = await Promise.all(seriesIds.map(async (id) => {
        try {
            const obsUrl = `${FRED_BASE_URL}/series/observations?series_id=${id}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=30`;

            const response = await fetch(obsUrl);
            if (!response.ok) {
                throw new Error(`FRED API returned status: ${response.status} for series ${id}`);
            }

            const data = await response.json();
            const observations = data.observations;

            if (!observations || observations.length === 0) {
                throw new Error(`No observations found for series ${id}`);
            }

            // Find the latest non-missing value
            const latest = observations.find((o: any) => o.value !== ".");
            const previous = observations.find((o: any, i: number) => i > observations.indexOf(latest) && o.value !== ".");

            let changePct = "0.00%";
            if (latest && previous) {
                const latestVal = parseFloat(latest.value);
                const previousVal = parseFloat(previous.value);
                if (previousVal !== 0) {
                    const change = ((latestVal - previousVal) / previousVal) * 100;
                    changePct = `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
                }
            }

            // Build history (chronological order) for sparklines
            const history = observations
                .filter((o: any) => o.value !== ".")
                .slice(0, 30)
                .reverse()
                .map((o: any) => ({
                    date: o.date,
                    value: parseFloat(o.value),
                }));

            const meta = COMMODITY_SERIES[id];

            return {
                id,
                title: meta.title,
                unit: meta.unit,
                prefix: meta.prefix || "",
                value: latest?.value === "." ? "N/A" : parseFloat(latest.value).toFixed(2),
                date: latest?.date || "N/A",
                changePct,
                history,
            };
        } catch (error) {
            logger.error(`Error fetching FRED commodity series ${id}:`, error);
            const meta = COMMODITY_SERIES[id];
            return {
                id,
                title: meta.title,
                unit: meta.unit,
                prefix: meta.prefix || "",
                value: "Error",
                date: "N/A",
                changePct: "0.00%",
                history: [],
            };
        }
    }));

    return results;
}
