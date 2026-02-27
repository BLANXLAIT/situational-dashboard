export async function getOutbreakAlerts() {
    const url = "https://www.who.int/api/hubs/diseaseoutbreaknews?" +
        "%24orderby=PublicationDate%20desc&%24top=10&" +
        "%24select=Title,PublicationDate,Summary,UrlName";

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`WHO API returned status: ${response.status}`);
    }

    const data = await response.json();
    const items = data.value || [];

    return items.map((item: any, index: number) => {
        const title = item.Title || "";
        // Strip HTML tags from summary
        const summary = (item.Summary || "").replace(/<[^>]*>/g, "").slice(0, 200);
        const date = item.PublicationDate?.slice(0, 10) || "";
        const url = `https://www.who.int/emergencies/disease-outbreak-news/item/${item.UrlName}`;

        // Infer severity from keywords
        let severity = "low";
        const lower = title.toLowerCase();
        if (lower.includes("marburg") || lower.includes("ebola") || lower.includes("nipah") || lower.includes("mers")) {
            severity = "high";
        } else if (lower.includes("mpox") || lower.includes("avian") || lower.includes("h5n1")) {
            severity = "medium";
        }

        return {
            id: item.UrlName || `who-${index}`,
            title,
            summary,
            date,
            url,
            severity,
        };
    });
}

export async function getInfluenzaTrends() {
    const url = "https://disease.sh/v3/influenza/cdc/ILINet";

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`disease.sh ILINet API returned status: ${response.status}`);
    }

    const data = await response.json();

    // Return the last 12 weeks of data
    const weeks = data.data || data;
    return weeks.slice(-12).map((w: any) => ({
        week: w.week,
        totalILI: w.totalILI,
        totalPatients: w.totalPatients,
        percentWeightedILI: w.percentWeightedILI,
    }));
}
