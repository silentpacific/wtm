import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';
import { DishExplanation } from "../../types";

const explanationSchema = {
    type: Type.OBJECT,
    properties: {
        explanation: {
            type: Type.STRING,
            description: "A concise explanation of the dish in under 300 characters. Should be easy for a tourist to understand."
        },
        tags: {
            type: Type.ARRAY,
            description: "An array of dietary and flavor tags (e.g., 'Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy', 'Sweet', 'Grilled', 'Fried').",
            items: {
                type: Type.STRING
            }
        },
        allergens: {
            type: Type.ARRAY,
            description: "An array of allergen information (e.g., 'Contains Nuts', 'Contains Dairy', 'Contains Gluten', 'Contains Shellfish', 'Contains Eggs').",
            items: {
                type: Type.STRING
            }
        }
    },
    required: ["explanation", "tags", "allergens"]
};

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseAnonKey || !geminiApiKey) {
    console.error('Missing environment variables:', {
        supabaseUrl: !!supabaseUrl,
        supabaseAnonKey: !!supabaseAnonKey,
        geminiApiKey: !!geminiApiKey
    });
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Fuzzy search function
const fuzzySearch = (searchTerm: string, targetString: string): number => {
    const search = searchTerm.toLowerCase().trim();
    const target = targetString.toLowerCase().trim();
    
    // Exact match
    if (search === target) return 1.0;
    
    // Contains match
    if (target.includes(search) || search.includes(target)) return 0.8;
    
    // Word-based matching
    const searchWords = search.split(/\s+/);
    const targetWords = target.split(/\s+/);
    
    let matchedWords = 0;
    for (const searchWord of searchWords) {
        for (const targetWord of targetWords) {
            if (searchWord === targetWord || 
                searchWord.includes(targetWord) || 
                targetWord.includes(searchWord)) {
                matchedWords++;
                break;
            }
        }
    }
    
    const wordMatchScore = matchedWords / Math.max(searchWords.length, targetWords.length);
    
    // Character similarity (simplified)
    let charMatches = 0;
    const minLength = Math.min(search.length, target.length);
    for (let i = 0; i < minLength; i++) {
        if (search[i] === target[i]) charMatches++;
    }
    const charMatchScore = charMatches / Math.max(search.length, target.length);
    
    return Math.max(wordMatchScore, charMatchScore * 0.6);
};

const handler: Handler = async (event: HandlerEvent) => {
    const dishName = event.queryStringParameters?.dishName;

    if (!dishName) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: "A dishName query parameter is required." }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
    
    if (!supabaseUrl || !supabaseAnonKey || !geminiApiKey) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Server environment variables are not configured correctly." }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    try {
        console.log(`Searching for dish: ${dishName}`);
        
        // 1. Get all dishes from database for fuzzy matching
        console.log('Fetching all dishes from database...');
        const { data: allDishes, error: fetchError } = await supabase
            .from('dishes')
            .select('name, explanation, tags, allergens');

        if (fetchError) {
            console.error("Database fetch error:", fetchError);
            throw new Error(`Database error: ${fetchError.message}`);
        }

        console.log(`Database returned ${allDishes ? allDishes.length : 0} dishes`);
        
        // Log first few dish names for debugging
        if (allDishes && allDishes.length > 0) {
            console.log('Sample dish names from DB:', allDishes.slice(0, 3).map(d => d.name));
        }

        // 2. Perform fuzzy search
        let bestMatch = null;
        let bestScore = 0;
        const FUZZY_THRESHOLD = 0.6; // Lowered threshold for better matching

        if (allDishes && allDishes.length > 0) {
            for (const dish of allDishes) {
                if (dish.name) {
                    const score = fuzzySearch(dishName, dish.name);
                    console.log(`Comparing "${dishName}" with "${dish.name}": score = ${score}`);
                    
                    if (score > bestScore && score >= FUZZY_THRESHOLD) {
                        bestScore = score;
                        bestMatch = dish;
                    }
                }
            }
        }

        // 3. If found in database with good confidence, return it
        if (bestMatch) {
            console.log(`Found match in DB: "${bestMatch.name}" (score: ${bestScore})`);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    explanation: bestMatch.explanation,
                    tags: bestMatch.tags || [],
                    allergens: bestMatch.allergens || []
                }),
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Data-Source': 'Database',
                    'X-Match-Score': bestScore.toString()
                }
            };
        }

        // 4. If not found in DB, call Gemini API
        console.log(`No match found in DB (best score: ${bestScore}), calling Gemini API for: ${dishName}`);
        
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const textPart = {
            text: `You are a culinary expert. Explain the dish "${decodeURIComponent(dishName)}". 
            Provide a concise explanation suitable for a tourist in under 300 characters. 
            
            For tags, include: dietary restrictions (Vegetarian, Vegan, Gluten-Free, Dairy-Free), cooking methods (Grilled, Fried, Steamed, Raw), and flavor profiles (Spicy, Sweet, Savory, Mild, Hot).
            
            For allergens, specifically list what the dish contains using this format: "Contains [allergen]" (e.g., "Contains Nuts", "Contains Dairy", "Contains Gluten", "Contains Shellfish", "Contains Eggs", "Contains Fish", "Contains Soy").
            
            If the dish doesn't contain common allergens, return an empty array for allergens.
            
            Respond in the requested JSON format.`
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

        // 5. Save to database for future use (only if it doesn't exist)
        console.log('Attempting to save new dish to database...');
        
        // Check if dish already exists before inserting
        const { data: existingDish } = await supabase
            .from('dishes')
            .select('id')
            .eq('name', dishName)
            .single();
            
        if (!existingDish) {
            const { error: insertError } = await supabase
                .from('dishes')
                .insert({ 
                    name: dishName, 
                    explanation: dishExplanation.explanation,
                    tags: dishExplanation.tags || [],
                    allergens: dishExplanation.allergens || []
                });
                
            if (insertError) {
                console.error("Supabase insert error:", insertError);
            } else {
                console.log(`Successfully saved new dish to DB: ${dishName}`);
            }
        } else {
            console.log(`Dish "${dishName}" already exists in database, skipping insert`);
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify(dishExplanation),
            headers: { 
                'Content-Type': 'application/json',
                'X-Data-Source': 'Gemini-API'
            }
        };

    } catch (error) {
        console.error("Error in getDishExplanation function:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred.";
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: `Failed to get explanation for "${dishName}". Reason: ${errorMessage}` 
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};

export { handler };