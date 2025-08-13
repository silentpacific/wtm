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

// Initialize Supabase client with service role for server-side operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey || !geminiApiKey) {
    console.error('Missing environment variables:', {
        supabaseUrl: !!supabaseUrl,
        supabaseServiceKey: !!supabaseServiceKey,
        supabaseAnonKey: !!supabaseAnonKey,
        geminiApiKey: !!geminiApiKey
    });
}

// Two Supabase clients: one for auth verification, one for admin operations
const supabaseAuth = createClient(supabaseUrl || '', supabaseAnonKey || '');
const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

// Rate limiting storage (in production environment, consider using Redis)
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Rate limiting function
function checkRateLimit(
    identifier: string, 
    maxRequests: number = 30, // 30 requests per 5 minutes per IP
    windowMs: number = 300000 // 5 minutes
): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(identifier);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + windowMs
        });
        return true;
    }

    if (entry.count >= maxRequests) {
        return false;
    }

    entry.count++;
    return true;
}

// Origin validation
function isValidOrigin(origin: string | undefined): boolean {
    if (!origin) return false;
    
    const allowedOrigins = [
        'https://whatthemenu.com',
        'https://www.whatthemenu.com',
        'https://whatthemenu.netlify.app',
        // Add your Netlify preview URLs
        ...(process.env.NODE_ENV === 'development' ? [
            'http://localhost:5173', 
            'http://localhost:3000',
            'http://127.0.0.1:5173'
        ] : [])
    ];

    // Check for Netlify deploy previews
    if (origin.includes('--whatthemenu.netlify.app')) {
        return true;
    }

    return allowedOrigins.includes(origin);
}

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // We validate origin manually
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
};

// Language-specific prompts (keeping your existing implementation)
const getLanguagePrompt = (dishName: string, language: string): string => {
    const baseInstructions = {
        en: `You are a culinary expert. Analyze the text "${decodeURIComponent(dishName)}".
        
        FIRST: Determine if this is actually a food dish or menu item. If it appears to be:
        - A person's name (e.g., "John Smith", "Association Football Player")
        - A sport or activity (e.g., "Football", "Basketball", "Swimming") 
        - A non-food item (e.g., "Table", "Chair", "Menu")
        - A random word or phrase that isn't food
        
        Then respond with this exact JSON format:
        {
            "explanation": "I can only explain food dishes and menu items. This appears to be [what it actually is] rather than a food item.",
            "tags": [],
            "allergens": [],
            "cuisine": "Not applicable"
        }
        
        IF IT IS A FOOD DISH: Provide a concise explanation suitable for a tourist in under 300 characters. 
        
        For tags, include: dietary restrictions (Vegetarian, Vegan, Gluten-Free, Dairy-Free), cooking methods (Grilled, Fried, Steamed, Raw), and flavor profiles (Spicy, Sweet, Savory, Mild, Hot).
        
        For allergens, specifically list what the dish contains using this format: "Contains [allergen]" (e.g., "Contains Nuts", "Contains Dairy", "Contains Gluten", "Contains Shellfish", "Contains Eggs", "Contains Fish", "Contains Soy").
        
        For cuisine, identify the specific cuisine type (e.g., "Italian", "Japanese", "Mexican", "Indian", "Thai", "French", "Chinese", "Mediterranean", "American", "Korean", "Vietnamese", "Greek", "Spanish", "Lebanese", "Moroccan", etc.). Be specific - use the most precise cuisine classification.
        
        If the dish doesn't contain common allergens, return an empty array for allergens.
        
        Respond in the requested JSON format.`,
        
        es: `Eres un experto culinario. Analiza el texto "${decodeURIComponent(dishName)}".
        
        PRIMERO: Determina si esto es realmente un plato de comida o elemento del menú. Si parece ser:
        - El nombre de una persona (ej., "John Smith", "Jugador de Fútbol")
        - Un deporte o actividad (ej., "Fútbol", "Baloncesto", "Natación")
        - Un elemento que no es comida (ej., "Mesa", "Silla", "Menú")
        - Una palabra o frase aleatoria que no es comida
        
        Entonces responde con este formato JSON exacto:
        {
            "explanation": "Solo puedo explicar platos de comida y elementos del menú. Esto parece ser [lo que realmente es] en lugar de un elemento de comida.",
            "tags": [],
            "allergens": [],
            "cuisine": "No aplicable"
        }
        
        SI ES UN PLATO DE COMIDA: Proporciona una explicación concisa adecuada para un turista en menos de 300 caracteres. 
        
        Para las etiquetas, incluye: restricciones dietéticas (Vegetariano, Vegano, Sin Gluten, Sin Lácteos), métodos de cocción (A la Parrilla, Frito, Al Vapor, Crudo), y perfiles de sabor (Picante, Dulce, Salado, Suave, Caliente).
        
        Para los alérgenos, especifica específicamente lo que contiene el plato usando este formato: "Contiene [alérgeno]" (ej., "Contiene Frutos Secos", "Contiene Lácteos", "Contiene Gluten", "Contiene Mariscos", "Contiene Huevos", "Contiene Pescado", "Contiene Soja").
        
        Para la cocina, identifica el tipo específico de cocina (ej., "Italiana", "Japonesa", "Mexicana", "India", "Tailandesa", "Francesa", "China", "Mediterránea", "Americana", "Coreana", "Vietnamita", "Griega", "Española", "Libanesa", "Marroquí", etc.). Sé específico - usa la clasificación de cocina más precisa.
        
        Si el plato no contiene alérgenos comunes, devuelve un array vacío para los alérgenos.
        
        Responde en el formato JSON solicitado, pero con todo el contenido en español.`,
        
        zh: `你是一位烹饪专家。分析文本"${decodeURIComponent(dishName)}"。
        
        首先：确定这是否真的是食物菜品或菜单项目。如果它似乎是：
        - 一个人的名字（例如，"John Smith"，"足球运动员"）
        - 一项运动或活动（例如，"足球"，"篮球"，"游泳"）
        - 非食物项目（例如，"桌子"，"椅子"，"菜单"）
        - 不是食物的随机词汇或短语
        
        那么用这个确切的JSON格式回应：
        {
            "explanation": "我只能解释食物菜品和菜单项目。这似乎是[它实际是什么]而不是食物项目。",
            "tags": [],
            "allergens": [],
            "cuisine": "不适用"
        }
        
        如果它是食物菜品：为游客提供300字符以内的简明解释。
        
        标签包括：饮食限制（素食、纯素、无麸质、无乳制品），烹饪方法（烤制、油炸、蒸制、生食），以及口味特征（辛辣、甜、咸、温和、热）。
        
        对于过敏原，请具体列出菜品包含的成分，使用此格式："含有[过敏原]"（如"含有坚果"、"含有乳制品"、"含有麸质"、"含有贝类"、"含有鸡蛋"、"含有鱼类"、"含有大豆"）。
        
        对于菜系，请识别具体的菜系类型（如"中式"、"日式"、"意式"、"印度"、"泰式"、"法式"、"地中海"、"美式"、"韩式"、"越式"、"希腊"、"西班牙"、"黎巴嫩"、"摩洛哥"等）。请具体 - 使用最精确的菜系分类。
        
        如果菜品不含常见过敏原，请为过敏原返回空数组。
        
        请用中文回应，并使用请求的JSON格式。`,
        
        fr: `Vous êtes un expert culinaire. Analysez le texte "${decodeURIComponent(dishName)}".
        
        D'ABORD : Déterminez si c'est vraiment un plat alimentaire ou un élément de menu. Si cela semble être :
        - Le nom d'une personne (ex., "John Smith", "Joueur de Football")
        - Un sport ou une activité (ex., "Football", "Basketball", "Natation")
        - Un élément non alimentaire (ex., "Table", "Chaise", "Menu")
        - Un mot ou une phrase aléatoire qui n'est pas de la nourriture
        
        Alors répondez avec ce format JSON exact :
        {
            "explanation": "Je ne peux expliquer que les plats alimentaires et les éléments de menu. Ceci semble être [ce que c'est réellement] plutôt qu'un élément alimentaire.",
            "tags": [],
            "allergens": [],
            "cuisine": "Non applicable"
        }
        
        SI C'EST UN PLAT ALIMENTAIRE : Fournissez une explication concise adaptée à un touriste en moins de 300 caractères.
        
        Pour les étiquettes, incluez : restrictions alimentaires (Végétarien, Végan, Sans Gluten, Sans Lactose), méthodes de cuisson (Grillé, Frit, Vapeur, Cru), et profils de saveur (Épicé, Sucré, Salé, Doux, Chaud).
        
        Pour les allergènes, spécifiez spécifiquement ce que contient le plat en utilisant ce format : "Contient [allergène]" (ex., "Contient Noix", "Contient Produits Laitiers", "Contient Gluten", "Contient Fruits de Mer", "Contient Œufs", "Contient Poisson", "Contient Soja").
        
        Pour la cuisine, identifiez le type de cuisine spécifique (ex., "Italienne", "Japonaise", "Mexicaine", "Indienne", "Thaïlandaise", "Française", "Chinoise", "Méditerranéenne", "Américaine", "Coréenne", "Vietnamienne", "Grecque", "Espagnole", "Libanaise", "Marocaine", etc.). Soyez spécifique - utilisez la classification culinaire la plus précise.
        
        Si le plat ne contient pas d'allergènes courants, retournez un tableau vide pour les allergènes.
        
        Répondez au format JSON demandé, mais avec tout le contenu en français.`
    };
    
    return baseInstructions[language as keyof typeof baseInstructions] || baseInstructions.en;
};

// Keep all your existing string processing functions
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
    const startTime = Date.now();

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
        };
    }

    // Validate origin
    const origin = event.headers.origin || event.headers.referer;
    if (!isValidOrigin(origin)) {
        console.log(`❌ Invalid origin: ${origin}`);
        return {
            statusCode: 403,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Request from unauthorized origin' })
        };
    }

    // Rate limiting by IP
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 
                     event.headers['x-real-ip'] || 
                     event.headers['client-ip'] || 
                     'unknown';
    
    if (!checkRateLimit(clientIP, 30, 300000)) { // 30 requests per 5 minutes
        return {
            statusCode: 429,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Too many requests. Please wait a moment before trying again.' 
            })
        };
    }

    // Parse request body
    let requestBody;
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Request body is required' })
            };
        }
        requestBody = JSON.parse(event.body);
    } catch (parseError) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
    }

    const { dishName, language, restaurantId, restaurantName } = requestBody;

    // Validate required fields
    if (!dishName) {
        return { 
            statusCode: 400, 
            headers: corsHeaders,
            body: JSON.stringify({ error: "dishName is required." })
        };
    }

    // Validate language parameter
    if (!['en', 'es', 'zh', 'fr'].includes(language)) {
        return { 
            statusCode: 400, 
            headers: corsHeaders,
            body: JSON.stringify({ error: "Unsupported language. Supported languages: en, es, zh, fr" })
        };
    }

    // Authentication check
    const authHeader = event.headers.authorization;
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
            // Verify the JWT token with Supabase
            const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
            
            if (error || !user) {
                return {
                    statusCode: 401,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Invalid or expired authentication token' })
                };
            }
            
            userId = user.id;
            console.log(`✅ Authenticated request from user: ${user.email}`);
            
        } catch (authError) {
            console.error('Token verification failed:', authError);
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Authentication failed' })
            };
        }
    } else {
        // No auth header - this is an anonymous request
        console.log('📝 Anonymous request detected');
    }
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey || !geminiApiKey) {
        return { 
            statusCode: 500, 
            headers: corsHeaders,
            body: JSON.stringify({ error: "Server configuration error." })
        };
    }

    try {
        console.log(`🔍 Processing dish explanation request: "${dishName}" in ${language}${restaurantId ? ` for restaurant: ${restaurantId}` : ''}`);
        
        // 1. Database search for existing explanations (using admin client for better performance)
		let { data: allDishes, error: fetchError } = await supabaseAdmin
			.rpc('get_dishes_by_language', { p_language: language });

        if (fetchError) {
            console.error("Database fetch error:", fetchError);
        }

        console.log(`📊 Database returned ${allDishes ? allDishes.length : 0} dishes for language: ${language}`);

        // 2. Fuzzy search with restaurant preference
        let bestMatch = null;
        let bestScore = 0;
        const FUZZY_THRESHOLD = 0.80;

        if (allDishes && allDishes.length > 0) {
            console.log(`🔎 Starting fuzzy search for ${language}...`);
            
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

        // 3. Return cached result if found
        if (bestMatch && bestScore >= FUZZY_THRESHOLD) {
            console.log(`✅ FOUND MATCH IN DB: "${bestMatch.name}" in ${language} (score: ${bestScore.toFixed(3)})`);
            
            // Increment restaurant explanation count if we have a restaurant ID
            if (restaurantId) {
                try {
                    const { error: updateError } = await supabaseAdmin
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
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                    'X-Data-Source': 'Database',
                    'X-Match-Score': bestScore.toString(),
                    'X-Language': language,
                    'X-Processing-Time': (Date.now() - startTime).toString()
                },
                body: JSON.stringify({
                    explanation: bestMatch.explanation,
                    tags: bestMatch.tags || [],
                    allergens: bestMatch.allergens || [],
                    cuisine: bestMatch.cuisine
                })
            };
        }

        // 4. Call Gemini API if not found in database
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

        // 5. Save to database for future use
        console.log(`💾 Checking for duplicates before saving: "${dishName}" in ${language}`);
        
        const duplicateExists = allDishes?.some(dish => 
            universalFuzzySearch(dishName, dish.name) >= FUZZY_THRESHOLD
        );
        
        if (!duplicateExists) {
            const insertData = { 
                name: dishName,
                language: language,
                menu_language: detectMenuLanguage(dishName),
                explanation: dishExplanation.explanation,
                tags: dishExplanation.tags || [],
                allergens: dishExplanation.allergens || [],
                cuisine: dishExplanation.cuisine || null,
                restaurant_id: restaurantId ? parseInt(restaurantId) : null,
                restaurant_name: restaurantName ? decodeURIComponent(restaurantName) : null
            };

            const { error: insertError } = await supabaseAdmin
                .from('dishes')
                .insert(insertData);
                
            if (insertError) {
                console.error("❌ Supabase insert error:", insertError);
            } else {
                console.log(`✅ Successfully saved new dish to DB: "${dishName}" in ${language} (menu language: ${insertData.menu_language})${restaurantId ? ` linked to restaurant ${restaurantId}` : ''}`);
            }
        } else {
            console.log(`ℹ️ Similar dish already exists in database for ${language}, skipping insert`);
        }

        // Increment restaurant explanation count for API responses too
        if (restaurantId) {
            try {
                const { error: updateError } = await supabaseAdmin
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
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'X-Data-Source': 'Gemini-API',
                'X-Language': language,
                'X-Processing-Time': (Date.now() - startTime).toString()
            },
            body: JSON.stringify(dishExplanation)
        };

    } catch (error) {
        console.error("❌ Error in getDishExplanation function:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred.";
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: `Failed to get explanation for "${dishName}" in ${language}. Reason: ${errorMessage}` 
            })
        };
    }
};