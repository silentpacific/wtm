// To use this function, you need to install the Netlify CLI and run `netlify dev`
// You also need to create a .env file in your root directory with:
// API_KEY=your_gemini_api_key
// SUPABASE_URL=your_supabase_url
// SUPABASE_ANON_KEY=your_supabase_anon_key

import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "../../services/supabaseClient";
import { DishExplanation } from "../../types";

const explanationSchema = {
    type: Type.OBJECT,
    properties: {
        explanation: {
            type: Type.STRING,
            description: "A concise, one-to-two sentence explanation of the dish. Should be easy for a tourist to understand."
        },
        tags: {
            type: Type.ARRAY,
            description: "An array of relevant dietary or flavor tags (e.g., 'Spicy', 'Vegetarian', 'Contains Nuts', 'Gluten-Free').",
            items: {
                type: Type.STRING
            }
        }
    },
    required: ["explanation", "tags"]
};

const handler: Handler = async (event: HandlerEvent) => {
    const dishName = event.queryStringParameters?.dishName;

    if (!dishName) {
        return { statusCode: 400, body: JSON.stringify({ error: "A dishName query parameter is required." }) };
    }
    
    if (!process.env.API_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: "Server environment variables are not configured correctly." }) };
    }

    try {
        // 1. Check database first (our cache)
        const { data: dbData, error: dbError } = await supabase
            .from('dishes')
            .select('explanation, tags')
            .eq('name', dishName)
            .single();

        // Let "no rows found" error pass, but throw others
        if (dbError && dbError.code !== 'PGRST116') {
             throw dbError;
        }

        if (dbData) {
            return {
                statusCode: 200,
                body: JSON.stringify(dbData),
                headers: { 'Content-Type': 'application/json', 'X-Data-Source': 'Database' }
            };
        }

        // 2. If not in DB, call Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const textPart = {
            text: `You are a culinary expert. Explain the dish "${decodeURIComponent(dishName)}". Provide a concise one-paragraph explanation suitable for a tourist. Also, provide a few relevant tags like "Spicy", "Vegetarian", "Contains Nuts", or "Gluten-Free". Respond in the requested JSON format.`
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: explanationSchema,
            },
        });

        const jsonText = response.text.trim();
        const dishExplanation: DishExplanation = JSON.parse(jsonText);

        // 3. Save to database for next time (fire and forget, don't block response)
        supabase
          .from('dishes')
          .insert({ name: dishName, ...dishExplanation })
          .then(({ error }) => {
            if (error) {
                // Log errors for monitoring, but don't fail the user's request
                console.error("Supabase insert error:", error);
            }
          });
        
        return {
            statusCode: 200,
            body: JSON.stringify(dishExplanation),
            headers: { 'Content-Type': 'application/json', 'X-Data-Source': 'Gemini-API' }
        };

    } catch (error) {
        console.error("Error in getDishExplanation function:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred.";
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Failed to get explanation for "${dishName}". Reason: ${errorMessage}` })
        };
    }
};

export { handler };
