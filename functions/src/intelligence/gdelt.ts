import * as logger from "firebase-functions/logger";

const GDELT_API_URL = "https://api.gdeltproject.org/api/v2/doc/doc";
const GDELT_QUERY = '"military conflict" OR "geopolitical tension" OR "armed conflict" OR "sanctions" sourcelang:english';

export interface GdeltArticle {
    title: string;
    url: string;
    domain: string;
    sourcecountry: string;
    seendate: string;
}

interface CacheEntry {
    data: GdeltArticle[];
    fetchedAt: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_RESULTS = 10;

export async function getGeopoliticalNews(): Promise<GdeltArticle[]> {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        logger.info("Returning cached GDELT data");
        return cache.data;
    }

    logger.info("Fetching geopolitical news from GDELT...");

    const params = new URLSearchParams({
        query: GDELT_QUERY,
        mode: "artlist",
        maxrecords: "20",
        format: "json",
        sort: "date",
        timespan: "24h",
    });

    const response = await fetch(`${GDELT_API_URL}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`GDELT API returned status: ${response.status}`);
    }

    const data = await response.json();
    const articles: GdeltArticle[] = [];

    if (!data.articles || !Array.isArray(data.articles)) {
        cache = { data: [], fetchedAt: Date.now() };
        return [];
    }

    const seenTitles = new Set<string>();
    const seenDomains = new Set<string>();

    for (const article of data.articles) {
        if (articles.length >= MAX_RESULTS) break;

        const titleKey = article.title?.toLowerCase().trim();
        if (!titleKey || seenTitles.has(titleKey)) continue;
        if (seenDomains.has(article.domain)) continue;

        seenTitles.add(titleKey);
        seenDomains.add(article.domain);

        articles.push({
            title: article.title,
            url: article.url,
            domain: article.domain,
            sourcecountry: article.sourcecountry ?? "",
            seendate: article.seendate,
        });
    }

    cache = { data: articles, fetchedAt: Date.now() };
    return articles;
}
