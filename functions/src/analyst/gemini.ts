import { GoogleGenerativeAI } from "@google/generative-ai";
import * as logger from "firebase-functions/logger";

export async function generateNarrative(apiKey: string, context: any) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `You are the S.A.A.M. (Strategic Autonomous Analysis Module) Intelligence Analyst. 
        Your goal is to synthesize disparate data streams into a cohesive, high-level "Situation Room" narrative.
        
        Guidelines:
        - Be objective, strategic, and concise.
        - Identify potential correlations between domains (e.g., how a natural disaster might affect financial markets).
        - Format your response in Markdown. Use bold headers for key sections.
        - Highlight "Critical Indicators" that require immediate attention.
        - End with a "Strategic Outlook".`
    });

    const prompt = `Current Global State Telemetry (JSON):
    ${JSON.stringify(context, null, 2)}
    
    Provide the Global Situation Narrative based on this data.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        logger.error("Gemini Narrative generation failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error in Gemini";
        throw new Error(`Analyst generation failed: ${errorMessage}`);
    }
}
