
import { GoogleGenAI } from "@google/genai";

// Store the client in a variable, but don't initialize it yet.
let ai: GoogleGenAI | null = null;

/**
 * Gets the singleton instance of the GoogleGenAI client.
 * Initializes the client on the first call.
 * @throws {Error} if the API_KEY environment variable is not set.
 * @returns {GoogleGenAI} The initialized AI client.
 */
function getAiClient(): GoogleGenAI {
  // If the client is already initialized, return it.
  if (ai) {
    return ai;
  }

  // Get the API key from the environment.
  const API_KEY = process.env.API_KEY;

  // Throw a descriptive error if the key is missing. This will be caught
  // by the UI and shown to the user.
  if (!API_KEY) {
    throw new Error("API_KEY environment variable not set. Please configure it in your deployment settings.");
  }

  // Initialize the client and store it for future use.
  ai = new GoogleGenAI({ apiKey: API_KEY });
  return ai;
}

export async function extractTextFromImage(base64Image: string, mimeType: string): Promise<string> {
  try {
    // Get the AI client. This will initialize it on the first run.
    const client = getAiClient();

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: "Extract all text from this document image. Present it clearly and accurately as a single block of text.",
    };

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Re-throw the error to be handled by the component.
    // If it's our custom API key error, it will be propagated.
    if (error instanceof Error) {
        throw new Error(`Failed to extract text: ${error.message}`);
    }
    throw new Error("Failed to extract text from the document due to an unknown AI model error.");
  }
}
