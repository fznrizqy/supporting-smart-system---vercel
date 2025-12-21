import { GoogleGenAI } from "@google/genai";
import { Equipment } from "../types";

export const analyzeEquipmentData = async (
  query: string, 
  equipmentList: Equipment[],
  role: string
): Promise<string> => {
  try {
    // Correct initialization using named parameter as per standard guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Create a context-aware system prompt
    const context = JSON.stringify(equipmentList.map(e => ({
      id: e.id,
      category: e.category, 
      division: e.division, 
      status: e.status,
      brand: e.brand,
      model: e.model,
      installDate: e.installationDate
    })));

    const systemInstruction = `
      You are an expert Laboratory Management Assistant for a corporate-level LIMS. 
      The current user role is: ${role}.
      Database Context (JSON):
      ${context}

      Guidelines:
      1. Answer questions based ONLY on the provided database context.
      2. If suggesting maintenance, reference specific equipment IDs.
      3. Maintain a professional, executive tone.
      4. Use Markdown for formatting (bolding, lists, etc.).
      5. If data is missing for a specific query, state that the information is not available in the current records.
    `;

    // Updated to latest recommended model for basic text and reasoning tasks
    const modelName = 'gemini-3-flash-preview'; 
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: query }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        topK: 40
      }
    });

    // Directly access .text property as per GenerateContentResponse class definition
    return response.text || "I couldn't generate a response at this time based on the laboratory records.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The Lab Assistant is currently unavailable. Please ensure your environment variable API_KEY is correctly configured in the Vercel dashboard.";
  }
};