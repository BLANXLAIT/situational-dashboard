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
exports.getIntelligenceStream = exports.getGeologicAlerts = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const usgs_1 = require("./geology/usgs");
const hackernews_1 = require("./intelligence/hackernews");
// Set strict CORS policy to prevent unauthorized web clients from draining quotas
const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://saam-dashboard-1772190712.web.app",
    "https://saam-dashboard-1772190712.firebaseapp.com"
];
// Endpoint to fetch live alerts from USGS
exports.getGeologicAlerts = (0, https_1.onRequest)({ cors: ALLOWED_ORIGINS, invoker: "public" }, async (request, response) => {
    logger.info("Fetching geologic alerts from USGS...");
    try {
        const alerts = await (0, usgs_1.getSignificantEarthquakes)();
        response.json({ alerts });
    }
    catch (error) {
        logger.error("Error fetching geologic alerts:", error);
        response.status(500).json({ error: "Failed to fetch alerts" });
    }
});
// Endpoint to fetch live tech news from Hacker News
exports.getIntelligenceStream = (0, https_1.onRequest)({ cors: ALLOWED_ORIGINS, invoker: "public" }, async (request, response) => {
    logger.info("Fetching intelligence stream from Hacker News...");
    try {
        const stream = await (0, hackernews_1.getTopTechNews)();
        response.json({ stream });
    }
    catch (error) {
        logger.error("Error fetching intelligence stream:", error);
        response.status(500).json({ error: "Failed to fetch top news" });
    }
});
//# sourceMappingURL=index.js.map