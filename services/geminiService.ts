import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateSantaVerdict = async (score: number, collectedPresents: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Santa Claus. A reindeer just finished a training run.
      Score: ${score} points.
      Presents Collected: ${collectedPresents}.
      
      Give a short, 2-sentence whimsical verdict on their performance. 
      If the score is low (< 1000), be encouraging but mention they need more practice flying.
      If the score is high (> 3000), be very impressed and call them "Sleigh Team Material".
      Use emojis.`,
    });
    return response.text || "Ho ho ho! Great flying!";
  } catch (error) {
    console.error("Error generating Santa verdict:", error);
    return "Ho ho ho! Keep practicing those flying skills!";
  }
};
