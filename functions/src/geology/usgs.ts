// modular handler to fetch earthquake data from the USGS API
export async function getSignificantEarthquakes() {
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`USGS API returned status: ${response.status}`);
        }

        const data = await response.json();

        // Map the USGS GeoJSON format to our frontend ALERTS format
        const alerts = data.features.map((feature: any, index: number) => {
            const mag = feature.properties.mag;

            // Determine severity based on magnitude
            let severity = 'low';
            if (mag >= 7.0) severity = 'high';
            else if (mag >= 6.0) severity = 'medium';

            // Format time
            const date = new Date(feature.properties.time);
            const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Create a descriptive message
            const tsunamiWarning = feature.properties.tsunami ? " Tsunami warning issued." : "";
            const desc = `Magnitude ${mag} earthquake reported. Depth: ${feature.geometry.coordinates[2]}km.${tsunamiWarning}`;

            return {
                id: feature.id || `usgs-${index}`,
                type: 'Earthquake',
                severity,
                title: feature.properties.title,
                time: timeString,
                timestamp: date.toISOString(),
                lat: feature.geometry.coordinates[1],
                lng: feature.geometry.coordinates[0],
                mag,
                desc
            };
        });

        return alerts;
    } catch (error) {
        throw new Error(`Failed to fetch from USGS: ${(error as Error).message}`);
    }
}
