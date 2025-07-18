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

// Universal string cleaning (minimal processing to preserve all languages)
const cleanString = (str: string): string => {
    return str
        .trim()
        // Only remove common punctuation that appears in menus
        .replace(/[.,!?;:"'()[\]{}]/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();
};

// Levenshtein Distance - works for ANY writing system
const levenshteinDistance = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Create matrix
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
    
    // Initialize first row and column
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    // Fill matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,     // deletion
                matrix[i][j - 1] + 1,     // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }
    
    return matrix[len1][len2];
};

// Universal similarity calculation
const calculateSimilarity = (str1: string, str2: string): number => {
    // Clean both strings minimally
    const clean1 = cleanString(str1);
    const clean2 = cleanString(str2);
    
    console.log(`  Cleaned: "${clean1}" vs "${clean2}"`);
    
    // Exact match (case-insensitive)
    if (clean1.toLowerCase() === clean2.toLowerCase()) {
        console.log(`  -> EXACT MATCH! Score: 1.0`);
        return 1.0;
    }
    
    // Exact match on original strings (preserves case sensitivity for non-Latin scripts)
    if (clean1 === clean2) {
        console.log(`  -> EXACT CASE MATCH! Score: 1.0`);
        return 1.0;
    }
    
    // Calculate similarity using Levenshtein distance
    const maxLength = Math.max(clean1.length, clean2.length);
    if (maxLength === 0) return 1.0; // Both empty strings
    
    const distance = levenshteinDistance(clean1, clean2);
    const similarity = (maxLength - distance) / maxLength;
    
    console.log(`  -> Levenshtein similarity: ${similarity.toFixed(3)} (distance: ${distance}, max: ${maxLength})`);
    
    // For very short strings, be more strict
    if (maxLength <= 3 && similarity < 0.8) {
        return 0;
    }
    
    return similarity;
};

// Multi-level fuzzy search that works for all languages
const universalFuzzySearch = (searchTerm: string, targetString: string): number => {
    console.log(`  Comparing: "${searchTerm}" vs "${targetString}"`);
    
    // Level 1: Direct similarity
    const directSimilarity = calculateSimilarity(searchTerm, targetString);
    
    // Level 2: Case-insensitive similarity (for Latin scripts)
    const lowerSimilarity = calculateSimilarity(searchTerm.toLowerCase(), targetString.toLowerCase());
    
    // Level 3: Word-by-word for languages that use spaces
    let wordSimilarity = 0;
    const searchWords = searchTerm.trim().split(/\s+/).filter(w => w.length > 0);
    const targetWords = targetString.trim().split(/\s+/).filter(w => w.length > 0);
    
    if (searchWords.length > 0 && targetWords.length > 0) {
        let totalSimilarity = 0;
        let matchCount = 0;
        
        for (const searchWord of searchWords) {
            let bestWordMatch = 0;
            for (const targetWord of targetWords) {
                const wordSim = calculateSimilarity(searchWord, targetWord);
                bestWordMatch = Math.max(bestWordMatch, wordSim);
            }
            if (bestWordMatch > 0.7) {
                totalSimilarity += bestWordMatch;
                matchCount++;
            }
        }
        
        if (matchCount > 0) {
            wordSimilarity = (totalSimilarity / matchCount) * (matchCount / Math.max(searchWords.length, targetWords.length));
            console.log(`  -> Word-based similarity: ${wordSimilarity.toFixed(3)}`);
        }
    }
    
    // Return the best similarity score
    const finalScore = Math.max(directSimilarity, lowerSimilarity, wordSimilarity);
    console.log(`  -> Final score: ${finalScore.toFixed(3)}`);
    
    return finalScore;
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

        // 2. Perform universal fuzzy search
        let bestMatch = null;
        let bestScore = 0;
        const FUZZY_THRESHOLD = 0.85; // High threshold for accuracy

        if (allDishes && allDishes.length > 0) {
            console.log(`🔎 Starting universal fuzzy search...`);
            
            for (const dish of allDishes) {
                if (dish.name) {
                    const score = universalFuzzySearch(dishName, dish.name);
                    
                    if (score > bestScore) {
                        bestScore = score;
                        if (score >= FUZZY_THRESHOLD) {
                            bestMatch = dish;
                            console.log(`✅ NEW BEST MATCH: "${dish.name}" with score ${score.toFixed(3)}`);
                        }
                    }
                }
            }
            
            console.log(`🎯 Best match: ${bestMatch ? `"${bestMatch.name}" (${bestScore.toFixed(3)})` : `None (best score: ${bestScore.toFixed(3)})`}`);
        }

        // 3. If found in database with good confidence, return it
        if (bestMatch && bestScore >= FUZZY_THRESHOLD) {
            console.log(`✅ FOUND MATCH IN DB: "${bestMatch.name}" (score: ${bestScore.toFixed(3)})`);
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
        console.log(`❌ No match found in DB (best score: ${bestScore.toFixed(3)}), calling Gemini API for: "${dishName}"`);
        
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

        // 5. Save to database for future use (check for duplicates using same algorithm)
        console.log(`💾 Checking for duplicates before saving: "${dishName}"`);
        
        const duplicateExists = allDishes?.some(dish => 
            universalFuzzySearch(dishName, dish.name) >= FUZZY_THRESHOLD
        );
        
        if (!duplicateExists) {
            const { error: insertError } = await supabase
                .from('dishes')
                .insert({ 
                    name: dishName, // Preserve original name exactly as scanned
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
            console.log(`ℹ️ Similar dish already exists in database, skipping insert`);
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