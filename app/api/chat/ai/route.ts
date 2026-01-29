import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ response: "Config Error: Missing GEMINI_API_KEY." }, { status: 500 });
        }

        // Clean keys just in case
        const cleanKey = apiKey.replace(/^["']|["']$/g, '');
        let modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        modelName = modelName.replace(/^["']|["']$/g, '');

        console.log(`Server: Initializing Gemini with model ${modelName} and key ending in ...${cleanKey.slice(-4)}`);

        const genAI = new GoogleGenerativeAI(cleanKey);
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

    } catch (error: any) {
        console.error("AI Chat Error Details:", error);

        let errorMessage = error?.message || "Unknown AI Error";

        // Enhance error message for the user logic
        if (errorMessage.includes("404") || errorMessage.includes("not found")) {
            errorMessage = `Model '${process.env.GEMINI_MODEL}' not found. Please check available models.`;
        } else if (errorMessage.includes("429")) {
            errorMessage = "Quota exceeded. Please try again later.";
        }

        return NextResponse.json({
            response: `AI Error: ${errorMessage}`,
            debug: errorMessage
        });
    }
}
