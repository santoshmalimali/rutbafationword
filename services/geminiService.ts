
import { GoogleGenAI } from "@google/genai";

export async function generateTryOnImage(userBase64: string, productBase64: string, productDesc: string, gender: string): Promise<string | null> {
  // Ensure process.env.API_KEY is available in the browser context
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please ensure process.env.API_KEY is configured.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `ACT AS A PROFESSIONAL VIRTUAL TRY-ON ENGINE.
INPUTS: 
- Image 1: The target person (${gender}).
- Image 2: The source garment (Product).

TASK:
1. Extract the EXACT garment from Image 2. 
2. Transfer this garment onto the person in Image 1.
3. CRITICAL: DO NOT change the color, pattern, texture, logos, or design of the garment from Image 2. It must remain 100% IDENTICAL to the source product.
4. Maintain the exact body structure, face, skin tone, and posture of the person in Image 1.
5. Realistic physics: The garment must wrap naturally around the body, showing realistic folds and shadows based on the person's pose.
6. Quality: 4K, ultra-realistic, professional fashion photography.
7. Output must look like a real photo of that person wearing that specific product.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: userBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            inlineData: {
              data: productBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error("No output parts received from Gemini");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini Try-On Error:", error);
    return null;
  }
}
