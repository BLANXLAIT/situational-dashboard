import * as logger from "firebase-functions/logger";

interface NOAAAlert {
    product_id: string;
    issue_datetime: string;
    message: string;
}

export async function getSpaceWeatherAlerts() {
    logger.info("Fetching Space Weather alerts from NOAA SWPC...");
    const url = "https://services.swpc.noaa.gov/products/alerts.json";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`NOAA API returned status: ${response.status}`);
        }

        const data: NOAAAlert[] = await response.json();

        // Map NOAA alerts to our dashboard format
        // We only want recent significant alerts (e.g., from the last 24-48 hours)
        // For simplicity, we'll take the top 5 most recent ones.
        const alerts = data.slice(0, 8).map((alert, index) => {
            const message = alert.message;

            // Basic severity inference from message content
            let severity = 'low';
            if (message.includes("WARNING") || message.includes("SEVERE") || message.includes("EXTREME")) {
                severity = 'high';
            } else if (message.includes("WATCH") || message.includes("MODERATE")) {
                severity = 'medium';
            }

            // Extract Type and Summary (NOAA messages are text blobs)
            // Example: "Type: Solar Flare Radio Blackout"
            const typeMatch = message.match(/Space Weather Message Code: ([^\n]+)/);
            const type = typeMatch ? typeMatch[1].trim() : "Space Weather Alert";

            // Clean up title (often starts with "SUMMARY:", "WARNING:", etc.)
            let title = "Recent Space Weather Activity";
            const summaryMatch = message.match(/(SUMMARY|WARNING|WATCH): ([^\n]+)/);
            if (summaryMatch) {
                title = summaryMatch[2].trim();
            }

            // Format time
            const date = new Date(alert.issue_datetime);
            const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return {
                id: `noaa-${index}-${alert.issue_datetime}`,
                type,
                severity,
                title,
                time: timeString,
                timestamp: date.toISOString(),
                desc: message.split('\n').slice(0, 3).join(' ').substring(0, 160) + "..."
            };
        });

        return alerts;
    } catch (error) {
        logger.error("Failed to fetch from NOAA:", error);
        throw new Error(`Failed to fetch from NOAA: ${(error as Error).message}`);
    }
}
