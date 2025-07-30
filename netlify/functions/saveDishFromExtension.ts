import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

// Same fuzzy search logic from your main API
const cleanString = (str: string): string => {
    return str
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:"()[\]{}]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const levenshteinDistance = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    
    return matrix[len1][len2];
};

const calculateSimilarity = (str1: string, str2: string): number => {
    const clean1 = cleanString(str1);
    const clean2 = cleanString(str2);
    
    if (clean1 === clean2) return 1.0;
    
    const maxLength = Math.max(clean1.length, clean2.length);
    if (maxLength === 0) return 1.0;
    
    const distance = levenshteinDistance(clean1, clean2);
    const similarity = (maxLength - distance) / maxLength;
    
    if (maxLength <= 3 && similarity < 0.8) return 0;
    
    return similarity;
};

const universalFuzzySearch = (searchTerm: string, targetString: string): number => {
    const directSimilarity = calculateSimilarity(searchTerm, targetString);
    
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
        }
    }
    
    return Math.max(directSimilarity, wordSimilarity);
};

const detectMenuLanguage = (dishName: string): string => {
    if (/[\u4e00-\u9fff]/.test(dishName)) return 'zh';
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(dishName)) return 'ja';
    if (/[\uac00-\ud7af]/.test(dishName)) return 'ko';
    if (/[\u0600-\u06ff\u0750-\u077f]/.test(dishName)) return 'ar';
    if (/[\u0590-\u05ff]/.test(dishName)) return 'he';
    if (/[\u0400-\u04ff]/.test(dishName)) return 'ru';
    if (/[\u0900-\u097f]/.test(dishName)) return 'hi';
    if (/[\u0e00-\u0e7f]/.test(dishName)) return 'th';
    if (/[\u0370-\u03ff]/.test(dishName)) return 'el';
    
    if (/[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/i.test(dishName) || 
        /\b(du|de|la|le|les|au|aux|avec|sur|dans|pour|et|à|chez|sous)\b/i.test(dishName)) {
        return 'fr';
    }
    
    if (/[ñáéíóúü]/i.test(dishName) || 
        /\b(con|del|de|la|el|los|las|y|en|al|por|para|desde|hasta)\b/i.test(dishName)) {
        return 'es';
    }
    
    if (/[ãõç]/i.test(dishName) || 
        /\b(com|do|da|dos|das|no|na|nos|nas|para|por|em)\b/i.test(dishName)) {
        return 'pt';
    }
    
    if (/\b(alla|con|di|al|del|della|dello|degli|delle|nel|nella|sui|sulle)\b/i.test(dishName)) {
        return 'it';
    }
    
    if (/[äöüß]/i.test(dishName) || 
        /\b(mit|und|der|die|das|von|zu|im|am|auf|für|bei|über)\b/i.test(dishName)) {
        return 'de';
    }
    
    if (/\b(met|van|de|het|een|in|op|aan|voor|bij|door)\b/i.test(dishName)) {
        return 'nl';
    }
    
    if (/[åøæ]/i.test(dishName) || 
        /\b(med|och|på|av|för|till|från|eller|som)\b/i.test(dishName)) {
        return 'sv';
    }
    
    if (/[ąćęłńóśźż]/i.test(dishName) || 
        /\b(z|w|na|do|od|dla|przez|przy|pod)\b/i.test(dishName)) {
        return 'pl';
    }
    
    if (/[çğıöşü]/i.test(dishName) || 
        /\b(ile|ve|bu|bir|için|gibi|kadar)\b/i.test(dishName)) {
        return 'tr';
    }
    
    if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(dishName)) {
        return 'vi';
    }
    
    return 'en';
};

export const handler: Handler = async (event: HandlerEvent) => {
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { dishName, explanation, tags, allergens, cuisine } = JSON.parse(event.body || '{}');
        
        if (!dishName || !explanation) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'dishName and explanation are required' })
            };
        }

        console.log(`💾 [Extension] Checking if dish exists: "${dishName}"`);
        
        // Check if dish already exists with fuzzy matching
        const { data: existingDishes, error: fetchError } = await supabaseAdmin
            .from('dishes')
            .select('name, explanation, tags, allergens, cuisine')
            .eq('language', 'en'); // Extension only uses English for now

        if (fetchError) {
            console.error("Database fetch error:", fetchError);
        }

        const FUZZY_THRESHOLD = 0.85;
        let dishExists = false;

        if (existingDishes && existingDishes.length > 0) {
            for (const dish of existingDishes) {
                if (dish.name) {
                    const similarity = universalFuzzySearch(dishName, dish.name);
                    if (similarity >= FUZZY_THRESHOLD) {
                        dishExists = true;
                        console.log(`✅ [Extension] Dish already exists: "${dish.name}" (similarity: ${similarity.toFixed(3)})`);
                        break;
                    }
                }
            }
        }

        if (!dishExists) {
            // Save new dish to database
            const insertData = { 
                name: dishName,
                language: 'en',
                menu_language: detectMenuLanguage(dishName),
                explanation: explanation,
                tags: tags || [],
                allergens: allergens || [],
                cuisine: cuisine || null,
                restaurant_id: null, // Extension doesn't have restaurant context
                restaurant_name: 'Chrome Extension Discovery'
            };

            const { error: insertError } = await supabaseAdmin
                .from('dishes')
                .insert(insertData);
                
            if (insertError) {
                console.error("❌ [Extension] Supabase insert error:", insertError);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Failed to save dish' })
                };
            } else {
                console.log(`✅ [Extension] Successfully saved new dish: "${dishName}"`);
            }
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ 
                success: true, 
                dishExists: dishExists,
                message: dishExists ? 'Dish already exists' : 'Dish saved successfully'
            })
        };

    } catch (error) {
        console.error("❌ [Extension] Error in saveDishFromExtension:", error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};