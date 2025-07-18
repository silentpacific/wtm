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

// Improved normalize function to handle punctuation and case
const normalizeDishName = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        // Remove punctuation
        .replace(/[.,!?;:"'()[\]{}]/g, '')
        // Replace multiple spaces with single space
        .replace(/\s+/g, ' ')
        .trim();
};

// Improved fuzzy search function
const fuzzySearch = (searchTerm: string, targetString: string): number => {
    const search = normalizeDishName(searchTerm);
    const target = normalizeDishName(targetString);
    
    console.log(`  Normalized: "${search}" vs "${target}"`);
    
    // Exact match after normalization
    if (search === target) {
        console.log(`  -> EXACT MATCH! Score: 1.0`);
        return 1.0;
    }
    
    // Contains match
    if (target.includes(search) || search.includes(target)) {
        console.log(`  -> CONTAINS MATCH! Score: 0.9`);
        return 0.9;
    }
    
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
    console.log(`  -> Word match score: ${wordMatchScore} (${matchedWords}/${Math.max(searchWords.length, targetWords.length)} words)`);
    
    return wordMatchScore;
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
        console.log(`🔍 Searching for dish: "${dishName}"`);
        
        // 1. Get all dishes from database for fuzzy matching
        const { data: allDishes, error: fetchError } = await supabase
            .from('dishes')
            .select('name, explanation, tags, allergens');

        if (fetchError) {
            console.error("Database fetch error:", fetchError);
            throw new Error(`Database error: ${fetchError.message}`);
        }

        console.log(`📊 Database returned ${allDishes ? allDishes.length : 0} dishes`);

        // 2. Perform fuzzy search
        let bestMatch = null;
        let bestScore = 0;
        const FUZZY_THRESHOLD = 0.8; // Higher threshold for better precision

        if (allDishes && allDishes.length > 0) {
            console.log(`🔎 Starting fuzzy search comparison...`);
            
            for (const dish of allDishes) {
                if (dish.name) {
                    console.log(`Comparing "${dishName}" with "${dish.name}"`);
                    const score = fuzzySearch(dishName, dish.name);
                    
                    if (score > bestScore) {
                        bestScore = score;
                        if (score >= FUZZY_THRESHOLD) {
                            bestMatch = dish;
                            console.log(`✅ NEW BEST MATCH: "${dish.name}" with score ${score}`);
                        }
                    }
                }
            }
            
            console.log(`🎯 Best match: ${bestMatch ? `"${bestMatch.name}" (${bestScore})` : `None (best score: ${bestScore})`}`);
        }

        // 3. If found in database with good confidence, return it
        if (bestMatch && bestScore >= FUZZY_THRESHOLD) {
            console.log(`✅ FOUND MATCH IN DB: "${bestMatch.name}" (score: ${bestScore})`);
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
        console.log(`❌ No match found in DB (best score: ${bestScore}), calling Gemini API for: "${dishName}"`);
        
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

        // 5. Save to database for future use (using normalized name to prevent duplicates)
        const normalizedDishName = normalizeDishName(dishName);
        console.log(`💾 Attempting to save dish with normalized name: "${normalizedDishName}"`);
        
        // Check if normalized dish name already exists
        const { data: existingDishes } = await supabase
            .from('dishes')
            .select('id, name');
            
        const duplicateExists = existingDishes?.some(dish => 
            normalizeDishName(dish.name) === normalizedDishName
        );
        
        if (!duplicateExists) {
            const { error: insertError } = await supabase
                .from('dishes')
                .insert({ 
                    name: dishName, // Keep original name but check with normalized
                    explanation: dishExplanation.explanation,
                    tags: dishExplanation.tags || [],
                    allergens: dishExplanation.allergens || []
                });
                
            if (insertError) {
                console.error("❌ Supabase insert error:", insertError);
            } else {
                console.log(`✅ Successfully saved new dish to DB: "${dishName}"`);
            }
        } else {
            console.log(`ℹ️ Dish with similar name already exists in database, skipping insert`);
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
        console.error("❌ Error in getDishExplanation function:", error);
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