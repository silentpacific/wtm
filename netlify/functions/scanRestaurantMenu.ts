import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface MenuScanRequest {
  image: string;
  filename: string;
  restaurantId: number;
  restaurantName: string;
  scanType: 'full_menu';
}

export const handler = async (event: any) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('🔍 Starting restaurant menu scan...');
    
    const body: MenuScanRequest = JSON.parse(event.body);
    const { image, filename, restaurantId, restaurantName } = body;

    if (!image || !restaurantId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Enhanced prompt for restaurant menu scanning
    const prompt = `You are analyzing a restaurant menu image for "${restaurantName}". 

EXTRACT ALL INFORMATION and return a JSON object with this EXACT structure:

{
  "restaurant_name": "extracted restaurant name if visible",
  "cuisine_type": "type of cuisine if identifiable",
  "header_notes": "any notes/text at the top of the menu (hours, policies, etc.)",
  "footer_notes": "any notes/text at the bottom of the menu (disclaimers, contact info, etc.)",
  "special_notes": "any other important notes on the menu",
  "dishes": [
    {
      "name": "exact dish name",
      "section": "menu section (Appetizers, Mains, Desserts, Drinks, etc.)",
      "price": numeric_price_or_null,
      "description": "dish description if available",
      "allergens": ["gluten", "dairy", "nuts", "eggs", "fish", "shellfish", "soy"],
      "dietary_tags": ["vegetarian", "vegan", "gluten-free", "dairy-free", "spicy", "organic"]
    }
  ]
}

IMPORTANT INSTRUCTIONS:
- Extract EVERY dish you can see, even if partially visible
- Group dishes into logical sections (Appetizers, Mains, Desserts, Drinks, etc.)
- For prices, extract the numeric value only (e.g., 15.99 not "$15.99")
- For allergens, look for common allergens in ingredients or descriptions
- For dietary tags, infer from dish names/descriptions (look for words like "vegetarian", "vegan", "gluten-free", etc.)
- Capture any header/footer text that contains restaurant policies, hours, contact info, etc.
- If you can't determine something, use null for prices or empty arrays for tags
- Return ONLY the JSON object, no other text

ALLERGEN DETECTION:
- Look for ingredients like: wheat, flour, bread (gluten), milk, cheese, butter (dairy), peanuts, almonds, walnuts (nuts), etc.
- Check descriptions for allergen warnings

DIETARY TAG DETECTION:
- "Vegetarian" or "V": vegetarian
- "Vegan" or "VG": vegan  
- "Gluten-free" or "GF": gluten-free
- Look for plant-based dishes, salads without meat, etc.`;

    console.log('🤖 Calling Gemini for menu analysis...');

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: filename.toLowerCase().includes('.pdf') ? 'application/pdf' : 'image/jpeg',
          data: image,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('📝 Raw Gemini response:', text);

    // Parse JSON response
    let menuData;
    try {
      // Clean up the response text (remove markdown formatting if any)
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      menuData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      console.error('Raw text:', text);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to parse menu analysis',
          details: 'The AI response was not in the expected format'
        }),
      };
    }

    console.log('✅ Parsed menu data:', JSON.stringify(menuData, null, 2));

    // Validate the response structure
    if (!menuData.dishes || !Array.isArray(menuData.dishes)) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid menu analysis',
          details: 'No dishes found in the menu'
        }),
      };
    }

    // Clean and validate dish data
    const cleanedDishes = menuData.dishes.map((dish: any) => ({
      name: dish.name || 'Unknown Dish',
      section: dish.section || 'Other',
      price: typeof dish.price === 'number' ? dish.price : null,
      description: dish.description || '',
      allergens: Array.isArray(dish.allergens) ? dish.allergens : [],
      dietary_tags: Array.isArray(dish.dietary_tags) ? dish.dietary_tags : []
    }));

    const finalResult = {
      restaurant_name: menuData.restaurant_name || restaurantName,
      cuisine_type: menuData.cuisine_type || null,
      header_notes: menuData.header_notes || '',
      footer_notes: menuData.footer_notes || '',
      special_notes: menuData.special_notes || '',
      dishes: cleanedDishes
    };

    console.log(`🎉 Menu scan complete! Found ${cleanedDishes.length} dishes`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(finalResult),
    };

  } catch (error) {
    console.error('❌ Menu scan error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Menu scanning failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};