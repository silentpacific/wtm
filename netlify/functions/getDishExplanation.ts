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
        },
        cuisine: {
            type: Type.STRING,
            description: "The specific cuisine type (e.g., 'Italian', 'Japanese', 'Mexican', 'Indian', 'Thai', 'French', 'Chinese', 'Mediterranean', 'American', 'Korean', 'Vietnamese', 'Greek', 'Spanish', 'Lebanese', 'Moroccan', etc.). Be specific and precise."
        }
    },
    required: ["explanation", "tags", "allergens", "cuisine"]
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

// Language-specific prompts
const getLanguagePrompt = (dishName: string, language: string): string => {
    const baseInstructions = {
        en: `You are a culinary expert. Explain the dish "${decodeURIComponent(dishName)}". 
        Provide a concise explanation suitable for a tourist in under 300 characters. 
        
        For tags, include: dietary restrictions (Vegetarian, Vegan, Gluten-Free, Dairy-Free), cooking methods (Grilled, Fried, Steamed, Raw), and flavor profiles (Spicy, Sweet, Savory, Mild, Hot).
        
        For allergens, specifically list what the dish contains using this format: "Contains [allergen]" (e.g., "Contains Nuts", "Contains Dairy", "Contains Gluten", "Contains Shellfish", "Contains Eggs", "Contains Fish", "Contains Soy").
        
        For cuisine, identify the specific cuisine type (e.g., "Italian", "Japanese", "Mexican", "Indian", "Thai", "French", "Chinese", "Mediterranean", "American", "Korean", "Vietnamese", "Greek", "Spanish", "Lebanese", "Moroccan", etc.). Be specific - use the most precise cuisine classification.
        
        If the dish doesn't contain common allergens, return an empty array for allergens.
        
        Respond in the requested JSON format.`,
        
        es: `Eres un experto culinario. Explica el plato "${decodeURIComponent(dishName)}". 
        Proporciona una explicación concisa adecuada para un turista en menos de 300 caracteres. 
        
        Para las etiquetas, incluye: restricciones dietéticas (Vegetariano, Vegano, Sin Gluten, Sin Lácteos), métodos de cocción (A la Parrilla, Frito, Al Vapor, Crudo), y perfiles de sabor (Picante, Dulce, Salado, Suave, Caliente).
        
        Para los alérgenos, especifica específicamente lo que contiene el plato usando este formato: "Contiene [alérgeno]" (ej., "Contiene Frutos Secos", "Contiene Lácteos", "Contiene Gluten", "Contiene Mariscos", "Contiene Huevos", "Contiene Pescado", "Contiene Soja").
        
        Para la cocina, identifica el tipo específico de cocina (ej., "Italiana", "Japonesa", "Mexicana", "India", "Tailandesa", "Francesa", "China", "Mediterránea", "Americana", "Coreana", "Vietnamita", "Griega", "Española", "Libanesa", "Marroquí", etc.). Sé específico - usa la clasificación de cocina más precisa.
        
        Si el plato no contiene alérgenos comunes, devuelve un array vacío para los alérgenos.
        
        Responde en el formato JSON solicitado, pero con todo el contenido en español.`,
        
        zh: `你是一位烹饪专家。请解释"${decodeURIComponent(dishName)}"这道菜。
        为游客提供300字符以内的简明解释。
        
        标签包括：饮食限制（素食、纯素、无麸质、无乳制品），烹饪方法（烤制、油炸、蒸制、生食），以及口味特征（辛辣、甜、咸、温和、热）。
        
        对于过敏原，请具体列出菜品包含的成分，使用此格式："含有[过敏原]"（如"含有坚果"、"含有乳制品"、"含有麸质"、"含有贝类"、"含有鸡蛋"、"含有鱼类"、"含有大豆"）。
        
        对于菜系，请识别具体的菜系类型（如"中式"、"日式"、"意式"、"印度"、"泰式"、"法式"、"地中海"、"美式"、"韩式"、"越式"、"希腊"、"西班牙"、"黎巴嫩"、"摩洛哥"等）。请具体 - 使用最精确的菜系分类。
        
        如果菜品不含常见过敏原，请为过敏原返回空数组。
        
        请用中文回应，并使用请求的JSON格式。`,
        
        fr: `Vous êtes un expert culinaire. Expliquez le plat "${decodeURIComponent(dishName)}". 
        Fournissez une explication concise adaptée à un touriste en moins de 300 caractères.
        
        Pour les étiquettes, incluez: restrictions alimentaires (Végétarien, Végan, Sans Gluten, Sans Lactose), méthodes de cuisson (Grillé, Frit, Vapeur, Cru), et profils de saveur (Épicé, Sucré, Salé, Doux, Chaud).
        
        Pour les allergènes, spécifiez spécifiquement ce que contient le plat en utilisant ce format: "Contient [allergène]" (ex., "Contient Noix", "Contient Produits Laitiers", "Contient Gluten", "Contient Fruits de Mer", "Contient Œufs", "Contient Poisson", "Contient Soja").
        
        Pour la cuisine, identifiez le type de cuisine spécifique (ex., "Italienne", "Japonaise", "Mexicaine", "Indienne", "Thaïlandaise", "Française", "Chinoise", "Méditerranéenne", "Américaine", "Coréenne", "Vietnamienne", "Grecque", "Espagnole", "Libanaise", "Marocaine", etc.). Soyez spécifique - utilisez la classification culinaire la plus précise.
        
        Si le plat ne contient pas d'allergènes courants, retournez un tableau vide pour les allergènes.
        
        Répondez au format JSON demandé, mais avec tout le contenu en français.`
    };
    
    return baseInstructions[language as keyof typeof baseInstructions] || baseInstructions.en;
};

// Universal string cleaning (minimal processing to preserve all languages)
const cleanString = (str: string): string => {
    return str
        .trim()
        .toLowerCase()
        // Only remove punctuation that's clearly not part of words
        .replace(/[.,!?;:"()[\]{}]/g, '')
        // Keep apostrophes and hyphens as they're often part of dish names
        // Keep accents and special characters for all languages
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
    const startTime = Date.now();
    const dishName = event.queryStringParameters?.dishName;
    const language = event.queryStringParameters?.language || 'en';
    const restaurantId = event.queryStringParameters?.restaurantId;
    const restaurantName = event.queryStringParameters?.restaurantName; // NEW: Get restaurant name

    if (!dishName) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: "A dishName query parameter is required." }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // Validate language parameter
    if (!['en', 'es', 'zh', 'fr'].includes(language)) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: "Unsupported language. Supported languages: en, es, zh, fr" }),
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
        console.log(`🔍 Searching for dish: "${dishName}" in language: ${language}${restaurantId ? ` for restaurant: ${restaurantId}` : ''}`);
        
        // 1. Enhanced database search - prioritize dishes from the same restaurant
        let { data: allDishes, error: fetchError } = await supabase
            .from('dishes')
            .select('name, explanation, tags, allergens, cuisine, restaurant_id')
            .eq('language', language);

        if (fetchError) {
            console.error("Database fetch error:", fetchError);
            // Don't throw error, just log and continue to Gemini API
        }

        console.log(`📊 Database returned ${allDishes ? allDishes.length : 0} dishes for language: ${language}`);

        // 2. Enhanced fuzzy search with restaurant preference
        let bestMatch = null;
        let bestScore = 0;
        const FUZZY_THRESHOLD = 0.80;

        if (allDishes && allDishes.length > 0) {
            console.log(`🔎 Starting enhanced fuzzy search for ${language}...`);
            
            for (const dish of allDishes) {
                if (dish.name) {
                    const score = universalFuzzySearch(dishName, dish.name);
                    
                    // Boost score if from same restaurant
                    const restaurantBonus = (restaurantId && dish.restaurant_id && 
                                           dish.restaurant_id.toString() === restaurantId) ? 0.1 : 0;
                    const finalScore = Math.min(score + restaurantBonus, 1.0);
                    
                    if (finalScore > bestScore) {
                        bestScore = finalScore;
                        if (finalScore >= FUZZY_THRESHOLD) {
                            bestMatch = dish;
                            console.log(`✅ NEW BEST MATCH: "${dish.name}" with score ${finalScore.toFixed(3)} ${restaurantBonus > 0 ? '(restaurant bonus applied)' : ''}`);
                        }
                    }
                }
            }
            
            console.log(`🎯 Best match: ${bestMatch ? `"${bestMatch.name}" (${bestScore.toFixed(3)})` : `None (best score: ${bestScore.toFixed(3)})`}`);
        }

        // 3. If found in database with good confidence, return it
        if (bestMatch && bestScore >= FUZZY_THRESHOLD) {
            console.log(`✅ FOUND MATCH IN DB: "${bestMatch.name}" in ${language} (score: ${bestScore.toFixed(3)})`);
            
            // NEW: Increment restaurant explanation count if we have a restaurant ID
            if (restaurantId) {
                try {
                    const { error: updateError } = await supabase
                        .rpc('increment_restaurant_explanation_count', { 
                            restaurant_id: parseInt(restaurantId) 
                        });
                        
                    if (updateError) {
                        console.error('Error incrementing restaurant explanation count:', updateError);
                    } else {
                        console.log(`✅ Incremented explanation count for restaurant ${restaurantId}`);
                    }
                } catch (error) {
                    console.error('Error updating restaurant explanation count:', error);
                }
            }
            
            return {
                statusCode: 200,
                body: JSON.stringify({
                    explanation: bestMatch.explanation,
                    tags: bestMatch.tags || [],
                    allergens: bestMatch.allergens || [],
                    cuisine: bestMatch.cuisine
                }),
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Data-Source': 'Database',
                    'X-Match-Score': bestScore.toString(),
                    'X-Language': language,
                    'X-Processing-Time': (Date.now() - startTime).toString()
                }
            };
        }

        // 4. If not found in DB, call Gemini API
        console.log(`❌ No match found in DB for ${language} (best score: ${bestScore.toFixed(3)}), calling Gemini API`);
        
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = getLanguagePrompt(dishName, language);
        const textPart = { text: prompt };

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

        // 5. Save to database with restaurant link and name
        console.log(`💾 Checking for duplicates before saving: "${dishName}" in ${language}`);
        
        const duplicateExists = allDishes?.some(dish => 
            universalFuzzySearch(dishName, dish.name) >= FUZZY_THRESHOLD
        );
        
        if (!duplicateExists) {
            const insertData = { 
                name: dishName,
                language: language, // explanation language
				menu_language: detectMenuLanguage(dishName), // NEW
                explanation: dishExplanation.explanation,
                tags: dishExplanation.tags || [],
                allergens: dishExplanation.allergens || [],
                cuisine: dishExplanation.cuisine || null,
                restaurant_id: restaurantId ? parseInt(restaurantId) : null,
                restaurant_name: restaurantName ? decodeURIComponent(restaurantName) : null // NEW: Store restaurant name
            };

            const { error: insertError } = await supabase
                .from('dishes')
                .insert(insertData);
                
            if (insertError) {
                console.error("❌ Supabase insert error:", insertError);
            } else {
                console.log(`✅ Successfully saved new dish to DB: "${dishName}" in ${language}${restaurantId ? ` linked to restaurant ${restaurantId}` : ''}`);
            }
        } else {
            console.log(`ℹ️ Similar dish already exists in database for ${language}, skipping insert`);
        }

        // NEW: Increment restaurant explanation count for API responses too
        if (restaurantId) {
            try {
                const { error: updateError } = await supabase
                    .rpc('increment_restaurant_explanation_count', { 
                        restaurant_id: parseInt(restaurantId) 
                    });
                    
                if (updateError) {
                    console.error('Error incrementing restaurant explanation count:', updateError);
                } else {
                    console.log(`✅ Incremented explanation count for restaurant ${restaurantId}`);
                }
            } catch (error) {
                console.error('Error updating restaurant explanation count:', error);
            }
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify(dishExplanation),
            headers: { 
                'Content-Type': 'application/json',
                'X-Data-Source': 'Gemini-API',
                'X-Language': language,
                'X-Processing-Time': (Date.now() - startTime).toString()
            }
        };

    } catch (error) {
        console.error("❌ Error in getDishExplanation function:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred.";
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: `Failed to get explanation for "${dishName}" in ${language}. Reason: ${errorMessage}` 
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};

export { handler };