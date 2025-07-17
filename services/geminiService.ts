import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MenuSection } from "../types";

// Ensure the API key is available from environment variables
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const menuSchema = {
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
};


export const analyzeMenu = async (base64Image: string): Promise<MenuSection[]> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const textPart = {
    text: `You are an expert menu analyst. Analyze this image of a restaurant menu. 
    Identify all the distinct sections (e.g., "Appetizers", "Soups", "Main Courses", "Desserts") and the dishes listed under each section.
    Return the output as a structured JSON array of objects. Each object should represent a menu section and have two properties: 'sectionTitle' and 'dishes'. 
    'dishes' should be an array of objects, where each object has a 'name' property for the dish name.
    Preserve the order of sections and dishes as they appear on the menu. 
    If some dishes are not under any specific section heading, group them under a section with an empty string for 'sectionTitle'.`
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: menuSchema,
      },
    });

    const jsonText = response.text.trim();
    const menuSections: MenuSection[] = JSON.parse(jsonText);
    
    // Filter out any sections that have no dishes, and dishes that have no name.
    return menuSections
      .map(section => ({
        ...section,
        dishes: section.dishes.filter(dish => dish.name && dish.name.trim() !== '')
      }))
      .filter(section => section.dishes.length > 0);

  } catch (error) {
    console.error("Error analyzing menu with Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze menu: ${error.message}`);
    }
    throw new Error("An unknown error occurred while analyzing the menu.");
  }
};