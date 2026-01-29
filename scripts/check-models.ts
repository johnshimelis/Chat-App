import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API KEY found in .env");
    process.exit(1);
}

console.log(`Checking models for key: ${apiKey.substring(0, 10)}...`);

async function listModels() {
    try {
        // Manual fetch since the SDK might not expose listModels directly easily in all versions, 
        // but actually the SDK usually doesn't have a direct 'listModels' on the entry point unless we use the v1beta API directly.
        // Let's use a simple fetch to the endpoint.
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\nAVAILABLE MODELS:");
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
