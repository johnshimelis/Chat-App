import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY");
            return NextResponse.json(
                { response: "Config Error: Missing Gemini API Key on server." },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // `gemini-pro` is deprecated for generateContent on v1beta; use a current model.
        // You can override this via `GEMINI_MODEL` without code changes.
        const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
        const model = genAI.getGenerativeModel({ model: modelName });

        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ response: "Please say something." }, { status: 400 });
        }

        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error: unknown) {
        console.error("AI Chat Error Details:", error);

        // Handle quota/rate limit errors specifically
        if (error instanceof Error) {
            const errorMessage = error.message;
            
            // Check for quota exceeded errors (429)
            if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("Too Many Requests")) {
                // Try to extract retry delay from error message
                const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i) || errorMessage.match(/RetryInfo.*retryDelay["']:\s*["']?(\d+)s/i);
                const retrySeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : null;
                
                let userMessage = "⚠️ API Quota Exceeded: You've reached your free tier limit for this model.";
                
                if (retrySeconds) {
                    userMessage += ` Please try again in ${retrySeconds} seconds.`;
                } else {
                    userMessage += " Please check your billing or try again later.";
                }
                
                userMessage += "\n\n💡 Tip: You can switch to a different model by setting the GEMINI_MODEL environment variable, or upgrade your Google Cloud billing plan.";
                
                return NextResponse.json(
                    { 
                        response: userMessage,
                        error: "QUOTA_EXCEEDED",
                        retryAfter: retrySeconds
                    },
                    { status: 429 }
                );
            }
            
            // Check for model not found errors (404)
            if (errorMessage.includes("404") || errorMessage.includes("not found")) {
                return NextResponse.json(
                    {
                        response: `⚠️ Model Not Found: The model "${modelName}" is not available. Please check your API key permissions or set a different model via GEMINI_MODEL environment variable.`,
                        error: "MODEL_NOT_FOUND"
                    },
                    { status: 404 }
                );
            }
            
            // Return the actual error message for other errors
            return NextResponse.json(
                { 
                    response: `AI Error: ${errorMessage}`,
                    error: "UNKNOWN_ERROR"
                },
                { status: 500 }
            );
        }
        
        // Fallback for non-Error types
        const errorMessage = typeof error === "string" ? error : "Unknown AI Error";
        return NextResponse.json(
            { 
                response: `AI Error: ${errorMessage}`,
                error: "UNKNOWN_ERROR"
            },
            { status: 500 }
        );
    }
}
