import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ suggestions: [] }, { status: 200 });
        }

        const cleanKey = apiKey.replace(/^["']|["']$/g, '');
        const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
        
        const { currentInput, history } = await req.json();

        if (!currentInput || currentInput.length < 3) {
            return NextResponse.json({ suggestions: [] });
        }

        const genAI = new GoogleGenerativeAI(cleanKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Create context from history
        const context = history && history.length > 0
            ? `Previous conversation:\n${history.slice(-3).join('\n')}\n\n`
            : '';

        const prompt = `${context}User is typing: "${currentInput}"

Generate 3 short, natural message completion suggestions (max 20 words each) that:
1. Complete the user's thought naturally
2. Are contextually relevant
3. Sound conversational and human-like
4. Are different from each other

Return ONLY a JSON array of strings, no other text. Example: ["suggestion 1", "suggestion 2", "suggestion 3"]`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Parse JSON response
        let suggestions: string[] = [];
        try {
            // Try to extract JSON array
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                suggestions = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback: split by lines and clean
                suggestions = response
                    .split('\n')
                    .filter(line => line.trim().length > 0 && line.length < 100)
                    .slice(0, 3)
                    .map(line => line.replace(/^[-•\d.]+\s*/, '').replace(/["']/g, '').trim());
            }
        } catch (e) {
            // If parsing fails, generate simple suggestions
            suggestions = [
                `${currentInput}...`,
                `I think ${currentInput.toLowerCase()}...`,
                `Let me know about ${currentInput.toLowerCase()}...`
            ].slice(0, 3);
        }

        // Format suggestions with confidence scores
        const formattedSuggestions = suggestions
            .filter(s => s.length > 0 && s.length < 150)
            .slice(0, 3)
            .map((text, index) => ({
                text: text.trim(),
                confidence: 0.9 - (index * 0.1) // Decreasing confidence
            }));

        return NextResponse.json({ suggestions: formattedSuggestions });
    } catch (error) {
        console.error("AI suggestion error:", error);
        return NextResponse.json({ suggestions: [] }, { status: 200 });
    }
}
