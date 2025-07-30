import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";

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

const geminiApiKey = process.env.GEMINI_API_KEY;

// Simple in-memory rate limiting for extensions
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(identifier: string, maxRequests: number = 60, windowMs: number = 3600000): boolean {
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

export const handler: Handler = async (event: HandlerEvent) => {
    const startTime = Date.now();

    // CORS headers - more permissive for extension
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, User-Agent',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'false'
    };

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

    // Rate limiting by IP (more generous for extensions)
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 
                     event.headers['x-real-ip'] || 
                     'unknown';
    
    if (!checkRateLimit(clientIP, 60, 3600000)) { // 60 requests per hour
        return {
            statusCode: 429,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Too many requests. Please wait before trying again.' 
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

    const { dishName, language } = requestBody;

    // Validate required fields
    if (!dishName) {
        return { 
            statusCode: 400, 
            headers: corsHeaders,
            body: JSON.stringify({ error: "dishName is required." })
        };
    }

    // Validate language parameter, default to English
    const supportedLanguages = ['en', 'es', 'zh', 'fr'];
    const selectedLanguage = language && supportedLanguages.includes(language) ? language : 'en';
    
    console.log(`🌍 [Extension] Using language: ${selectedLanguage}`);

    if (!geminiApiKey) {
        return { 
            statusCode: 500, 
            headers: corsHeaders,
            body: JSON.stringify({ error: "Server configuration error." })
        };
    }

    try {
        console.log(`🔍 [Extension] Processing dish explanation request: "${dishName}"`);
        
        // Call Gemini API directly (no database caching for extension to keep it simple)
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = getLanguagePrompt(dishName);
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
        const dishExplanation = JSON.parse(jsonText);

        console.log(`✅ [Extension] Successfully explained: "${dishName}"`);
        
        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'X-Data-Source': 'Gemini-API-Extension',
                'X-Processing-Time': (Date.now() - startTime).toString()
            },
            body: JSON.stringify(dishExplanation)
        };

    } catch (error) {
        console.error("❌ [Extension] Error in getDishExplanationExtension function:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred.";
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: `Failed to get explanation for "${dishName}". Reason: ${errorMessage}` 
            })
        };
    }
};