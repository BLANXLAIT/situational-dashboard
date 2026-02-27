import * as logger from "firebase-functions/logger";

const FRED_BASE_URL = "https://api.stlouisfed.org/fred";

interface FredObservation {
    date: string;
    value: string;
}

interface FredObservation {
    date: string;
    value: string;
}

const SERIES_METADATA: Record<string, string> = {
    GDPC1: "Real Gross Domestic Product",
    UNRATE: "Unemployment Rate",
    CPIAUCSL: "Consumer Price Index",
    FEDFUNDS: "Federal Funds Effective Rate",
};

export async function getMacroEconomicData(apiKey: string) {
    logger.info("Fetching macro economic data from FRED...");

    const seriesIds = Object.keys(SERIES_METADATA);

    const results = await Promise.all(seriesIds.map(async (id) => {
        try {
            // Fetch series observations for the last 12 months/quarters
            // We use the JSON format and fetch only recent data
            const obsUrl = `${FRED_BASE_URL}/series/observations?series_id=${id}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=12`;

            const response = await fetch(obsUrl);
            if (!response.ok) {
                throw new Error(`FRED API returned status: ${response.status} for series ${id}`);
            }

            const data = await response.json();
            const observations: FredObservation[] = data.observations;

            if (!observations || observations.length === 0) {
                throw new Error(`No observations found for series ${id}`);
            }

            const latest = observations[0];
            const previous = observations[1];

            // Calculate change if possible
            let changePct = "0.00%";
            if (previous && latest.value !== "." && previous.value !== ".") {
                const latestVal = parseFloat(latest.value);
                const previousVal = parseFloat(previous.value);
                if (previousVal !== 0) {
                    const change = ((latestVal - previousVal) / previousVal) * 100;
                    changePct = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
                }
            }

            // Return historical data for sparklines (reverse back to chronological)
            const history = observations.slice(0, 12).reverse().map(obs => ({
                date: obs.date,
                value: obs.value === "." ? 0 : parseFloat(obs.value)
            }));

            return {
                id,
                title: SERIES_METADATA[id],
                value: latest.value === "." ? "N/A" : latest.value,
                date: latest.date,
                changePct,
                history
            };
        } catch (error) {
            logger.error(`Error fetching FRED series ${id}:`, error);
            return {
                id,
                title: SERIES_METADATA[id],
                value: "Error",
                date: "N/A",
                changePct: "0.00%",
                history: []
            };
        }
    }));

    return results;
}
