
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  console.error("API_KEY for Gemini is not set in environment variables.");
}

// FIX: Initialized GoogleGenAI using a named parameter with process.env.API_KEY directly, as per coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generatePatientExplanation = async (diagnosis: string): Promise<string> => {
  // FIX: Using process.env.API_KEY directly for the check. This is a useful guard to prevent an unnecessary API call if the key is not configured.
  if (!process.env.API_KEY) {
    return "Error: La clave API de Gemini no está configurada.";
  }
  if (!diagnosis.trim()) {
    return "Por favor, ingrese un diagnóstico para generar una explicación.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explica el siguiente diagnóstico médico en términos muy simples y claros para un paciente que no tiene conocimientos médicos. Usa un tono tranquilizador y positivo. Diagnóstico: "${diagnosis}"`,
       config: {
        temperature: 0.5,
        topP: 0.95,
        topK: 64,
       }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Hubo un error al generar la explicación. Por favor, intente de nuevo.";
  }
};
