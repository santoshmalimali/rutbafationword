
import { GoogleGenAI } from "@google/genai";

export async function generateTryOnImage(userBase64: string, productBase64: string, productDesc: string, gender: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey:import.meta.env.VITE_GEMINI_API_KEY });
    
    // The prompt is strictly followed as per user request to ensure realism.
    // We provide both images: the person and the product.
    const prompt = `Use the uploaded image of the ${gender} (Image 1) as the base model. 
Keep the original face, hairstyle, beard, skin tone, and exact body structure unchanged. 
Do not modify body shape, height, or facial features.
Replace only the outfit with the EXACT clothing shown in Image 2.
Description of clothing: ${productDesc}.
The clothing from Image 2 must fit naturally according to his body posture and size.
Maintain realistic fabric folds, shadows, lighting direction, and depth.
Generate ultra-realistic 4K quality image.
Professional fashion photoshoot look.
Sharp focus, natural skin texture, no AI distortion.
Studio lighting, soft shadow, clean background.
The final result must look like a real DSLR product photoshoot.
No cartoon effect, no artificial smoothing.
Maintain authenticity and realism.`;

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

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
