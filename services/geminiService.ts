import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const generateFitnessAdvice = async (prompt: string): Promise<string> => {
  try {
    const aiInstance = getAI();
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are Coach PowHER, an energetic, motivating, and scientifically informed fitness and nutrition coach. Your goal is to empower users to reach their fitness goals. Keep responses concise, actionable, and encouraging. Use bullet points for readability when listing exercises or meals.",
        temperature: 0.7,
      }
    });
    return response.text || "I'm having trouble connecting to the gym mainframe right now. Try again in a moment!";
  } catch (error) {
    console.error("Error generating advice:", error);
    return "Something went wrong while consulting the AI Coach. Please check your connection.";
  }
};

export const generateWorkoutPlan = async (goal: string, level: string, timeAvailable: string): Promise<string> => {
  const prompt = `Create a specific ${timeAvailable} minute workout plan for a ${level} level lifter whose goal is ${goal}. Return the response as a structured list of exercises with sets and rep ranges.`;
  return generateFitnessAdvice(prompt);
};

export const generateMealIdea = async (calories: number, type: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Promise<string> => {
  const prompt = `Suggest a healthy, high-protein ${type} recipe that is approximately ${calories} calories. Include ingredients and basic instructions.`;
  return generateFitnessAdvice(prompt);
}