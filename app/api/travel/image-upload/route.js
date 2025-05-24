import { analyzeImage } from "@/lib/gemini"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const image = formData.get("image")
    const message = formData.get("message") || ""
    const sessionId = formData.get("sessionId")

    if (!image) {
      return NextResponse.json({ message: "Image is required" }, { status: 400 })
    }

    console.log("Processing image upload for travel analysis")

    // Convert image to buffer
    const imageBuffer = Buffer.from(await image.arrayBuffer())

    // Enhanced prompt for image analysis with task generation
    const prompt = message
      ? `The user uploaded an image and asked: "${message}". Please analyze this travel-related image and respond to their question. Also generate relevant travel tasks based on what you see and their question.

RESPONSE:
[Your analysis and response]

TASKS:
[Generate relevant tasks in JSON format based on the image and question]`
      : `Analyze this travel-related image. Identify the location if possible, describe what you see, and provide relevant travel information or recommendations.

RESPONSE:
[Your analysis]

TASKS:
[Generate relevant travel tasks based on what you see in the image, such as visiting this location, booking accommodations, or planning activities]`

    const response = await analyzeImage(imageBuffer, prompt)

    // Extract tasks from the response
    let extractedTasks = []
    try {
      const tasksMatch = response.match(/TASKS:\s*(\[[\s\S]*?\])/i)
      if (tasksMatch && tasksMatch[1]) {
        const tasksJson = tasksMatch[1].trim()
        if (tasksJson !== "[]") {
          extractedTasks = JSON.parse(tasksJson)
        }
      }
    } catch (parseError) {
      console.error("Failed to parse tasks from image analysis:", parseError)
    }

    // Clean up the response
    const cleanResponse = response
      .replace(/TASKS:\s*\[[\s\S]*?\]/i, "")
      .replace(/RESPONSE:\s*/i, "")
      .trim()

    return NextResponse.json({
      success: true,
      data: cleanResponse,
      tasks: extractedTasks,
      sessionId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json({ message: error.message || "Failed to process image" }, { status: 500 })
  }
}
