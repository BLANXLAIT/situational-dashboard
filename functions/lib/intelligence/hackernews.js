"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopTechNews = getTopTechNews;
const logger = __importStar(require("firebase-functions/logger"));
async function getTopTechNews() {
    logger.info("Fetching top stories from Hacker News...");
    try {
        // 1. Fetch top ~500 story IDs
        const topStoriesUrl = "https://hacker-news.firebaseio.com/v0/topstories.json";
        const idsResponse = await fetch(topStoriesUrl);
        if (!idsResponse.ok) {
            throw new Error(`HN API /topstories returned status: ${idsResponse.status}`);
        }
        const storyIds = await idsResponse.json();
        // 2. We only want to display the top 10 on the dashboard to keep it actionable
        const top10Ids = storyIds.slice(0, 10);
        // 3. Fetch details for each of the top 10 stories concurrently
        const storyPromises = top10Ids.map(async (id) => {
            const itemUrl = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
            const itemResponse = await fetch(itemUrl);
            if (itemResponse.ok) {
                return itemResponse.json();
            }
            return null;
        });
        const stories = await Promise.all(storyPromises);
        // 4. Map the raw HN data to our ALERTS format for the NewsStreamWidget
        const formattedStream = stories
            .filter((s) => s !== null && s.type === "story")
            .map((story) => {
            // Calculate relative time (e.g., "2 hrs ago")
            const now = Math.floor(Date.now() / 1000);
            const diffSeconds = now - story.time;
            let timeString = "Just now";
            if (diffSeconds > 3600) {
                timeString = `${Math.floor(diffSeconds / 3600)} hrs ago`;
            }
            else if (diffSeconds > 60) {
                timeString = `${Math.floor(diffSeconds / 60)} mins ago`;
            }
            // For a true "intelligence stream", we might use Gemini later to generate a summary.
            // For now, we will just pass the title and URL as the "summary" body.
            return {
                id: story.id,
                source: 'Hacker News',
                domain: 'Tech & AI',
                title: story.title,
                summary: story.url ? `Source Link: ${story.url}` : 'No external link provided.',
                time: timeString,
                score: story.score
            };
        });
        return formattedStream;
    }
    catch (error) {
        throw new Error(`Failed to fetch from Hacker News: ${error.message}`);
    }
}
//# sourceMappingURL=hackernews.js.map