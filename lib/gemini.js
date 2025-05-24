import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
})

export async function generateTravelResponse(prompt, context = "") {
  try {
    const fullPrompt = `You are a helpful travel assistant. ${context ? `Context: ${context}` : ""} 
    
User question: ${prompt}

Please provide helpful, accurate travel information. If asked about hotels, destinations, or travel planning, give specific and useful advice. Format your response in a clear, conversational way.`

    const result = await geminiModel.generateContent(fullPrompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Gemini API error:", error)
    throw new Error("Failed to generate AI response")
  }
}

export async function analyzeImage(imageBuffer, prompt = "") {
  try {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/jpeg",
      },
    }

    const fullPrompt =
      prompt ||
      "Analyze this travel-related image and provide information about the location, landmarks, or travel recommendations."

    const result = await geminiModel.generateContent([fullPrompt, imagePart])
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Gemini image analysis error:", error)
    throw new Error("Failed to analyze image")
  }
}
