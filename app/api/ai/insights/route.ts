import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ insights: [] }, { status: 200 });
        }

        const cleanKey = apiKey.replace(/^["']|["']$/g, '');
        const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
        
        const { messages } = await req.json();

        if (!messages || messages.length < 5) {
            return NextResponse.json({ insights: [] });
        }

        const genAI = new GoogleGenerativeAI(cleanKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Format conversation
        const conversation = messages
            .slice(-20)
            .map((m: any) => `${m.senderId === 'user' ? 'User' : 'Other'}: ${m.content}`)
            .join('\n');

        const prompt = `Analyze this conversation and provide 2-3 brief insights (max 50 words each):

${conversation}

Provide insights about:
1. Overall sentiment/tone
2. Main topics discussed
3. Brief summary

Return ONLY a JSON array with this format:
[
  {"type": "sentiment", "title": "Sentiment", "content": "brief analysis"},
  {"type": "topic", "title": "Topics", "content": "main topics"},
  {"type": "summary", "title": "Summary", "content": "brief summary"}
]`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        let insights: any[] = [];
        try {
            const jsonMatch = response.match(/\[.*\]/s);
            if (jsonMatch) {
                insights = JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            // Fallback insights
            insights = [
                {
                    type: "summary",
                    title: "Conversation Summary",
                    content: "Active conversation with multiple exchanges"
                }
            ];
        }

        return NextResponse.json({ insights });
    } catch (error) {
        console.error("Insights error:", error);
        return NextResponse.json({ insights: [] }, { status: 200 });
    }
}
