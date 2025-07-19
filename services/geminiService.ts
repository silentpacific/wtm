import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MenuSection, MenuAnalysisResult } from "../types";

// Ensure the API key is available from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY environment variable not set");
}

// Initialize the AI client
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Enhanced schema to include restaurant detection
const menuAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    restaurantName: {
      type: Type.STRING,
      description: "The name of the restaurant extracted from the menu. Look for restaurant names in headers, logos, or watermarks. If not found, return empty string."
    },
    detectedCuisine: {
      type: Type.STRING,
      description: "The type of cuisine based on the menu items (e.g., 'Italian', 'Chinese', 'Mexican', 'American', etc.). If unclear, return empty string."
    },
    sections: {
      type: Type.ARRAY,
      description: "An array of menu sections. Each section has a title and a list of dishes.",
      items: {
        type: Type.OBJECT,
        properties: {
          sectionTitle: {
            type: Type.STRING,
            description: "The title of the menu section (e.g., 'Appetizers', 'Main Courses'). If no title is present for a group of dishes, use an empty string."
          },
          dishes: {
            type: Type.ARRAY,
            description: "An array of dishes found within this section.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: 'The name of the dish.'
                }
              },
              required: ['name']
            }
          }
        },
        required: ['sectionTitle', 'dishes']
      }
    }
  },
  required: ['restaurantName', 'detectedCuisine', 'sections']
};

export const analyzeMenu = async (base64Image: string): Promise<MenuAnalysisResult> => {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY environment variable.");
  }

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const textPart = {
    text: `You are an expert menu analyst. Analyze this image of a restaurant menu.

    FIRST: Look for the restaurant name - check headers, logos, watermarks, or any text that indicates the restaurant name.
    
    SECOND: Determine the cuisine type based on the dishes and style (Italian, Chinese, Mexican, American, etc.).
    
    THIRD: Identify all the distinct sections (e.g., "Appetizers", "Soups", "Main Courses", "Desserts") and the dishes listed under each section.

    Return the output as a structured JSON object with:
    - restaurantName: The name of the restaurant (empty string if not found)
    - detectedCuisine: The type of cuisine (empty string if unclear)
    - sections: Array of menu sections with dishes

    Preserve the order of sections and dishes as they appear on the menu.`
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: menuAnalysisSchema,
      },
    });

    const jsonText = response.text.trim();
    const result: MenuAnalysisResult = JSON.parse(jsonText);
    
    // Filter out any sections that have no dishes, and dishes that have no name
    const filteredSections = result.sections
      .map(section => ({
        ...section,
        dishes: section.dishes.filter(dish => dish.name && dish.name.trim() !== '')
      }))
      .filter(section => section.dishes.length > 0);

    return {
      sections: filteredSections,
      restaurantName: result.restaurantName?.trim() || '',
      detectedCuisine: result.detectedCuisine?.trim() || ''
    };

  } catch (error) {
    console.error("Error analyzing menu with Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze menu: ${error.message}`);
    }
    throw new Error("An unknown error occurred while analyzing the menu.");
  }
};