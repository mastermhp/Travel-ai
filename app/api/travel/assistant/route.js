import { generateTravelResponse } from "@/lib/gemini"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { query, sessionId } = await request.json()

    if (!query) {
      return NextResponse.json({ message: "Query is required" }, { status: 400 })
    }

    console.log("Processing travel assistant query:", query)

    // Enhanced prompt to generate actionable tasks automatically
    const enhancedPrompt = `You are a comprehensive travel planning assistant. When users ask about travel plans, destinations, or trip preparation, provide helpful information AND automatically generate actionable tasks they should complete.

User query: ${query}

Please provide a helpful response and then extract any actionable tasks from your advice. 

IMPORTANT: Always generate relevant tasks when users mention:
- Wanting to visit a destination
- Planning a trip
- Asking about travel requirements
- Needing help with bookings
- Asking about activities or attractions

Format your response EXACTLY like this:

RESPONSE:
[Your helpful travel advice here - be comprehensive and detailed. DO NOT mention tasks or JSON in this section. Just provide natural travel advice.]

TASKS:
[Always provide actionable tasks in this JSON format, even for simple queries:]
[
  {
    "title": "Task title",
    "description": "Detailed description of what needs to be done",
    "category": "preparation|booking|transportation|activities|documents",
    "priority": "high|medium|low",
    "suggestedDueDate": "YYYY-MM-DD or relative like '+30 days'",
    "estimatedCost": "Optional cost estimate like '$200-300'",
    "tips": "Additional helpful tips for completing this task"
  }
]

IMPORTANT: The RESPONSE section should be natural travel advice without mentioning tasks. The TASKS section should be separate and properly formatted JSON.

Examples of tasks to generate:
- For visa requirements: "Apply for tourist visa"
- For flights: "Book round-trip flights"
- For hotels: "Reserve accommodation"
- For activities: "Book [specific activity]"
- For preparation: "Get travel insurance", "Exchange currency", "Pack essentials"
- For documents: "Check passport validity", "Get travel vaccinations"

If the user mentions a specific destination, create destination-specific tasks.`

    // Generate response using Gemini AI
    const response = await generateTravelResponse(enhancedPrompt)

    console.log("Raw AI response:", response)

    // Extract tasks from the response
    let extractedTasks = []
    try {
      const tasksMatch = response.match(/TASKS:\s*(\[[\s\S]*?\])/i)
      if (tasksMatch && tasksMatch[1]) {
        const tasksJson = tasksMatch[1].trim()
        if (tasksJson !== "[]") {
          extractedTasks = JSON.parse(tasksJson)
          console.log("Successfully extracted tasks:", extractedTasks)
        }
      } else {
        console.log("No tasks section found, generating fallback tasks")
        extractedTasks = generateFallbackTasks(query)
      }
    } catch (parseError) {
      console.error("Failed to parse tasks from AI response:", parseError)
      console.log("Generating fallback tasks due to parse error")
      extractedTasks = generateFallbackTasks(query)
    }

    // Extract clean response (remove TASKS section completely)
    let cleanResponse = response
      .replace(/TASKS:\s*\[[\s\S]*?\]/i, "")
      .replace(/RESPONSE:\s*/i, "")
      .trim()

    // If the response still contains JSON-like content, clean it further
    if (cleanResponse.includes('"title":') || cleanResponse.includes('"description":')) {
      // Find the last occurrence of proper text before any JSON
      const lines = cleanResponse.split("\n")
      const cleanLines = []

      for (const line of lines) {
        if (line.includes('"title":') || line.includes('"description":') || line.includes("{") || line.includes("}")) {
          break
        }
        cleanLines.push(line)
      }

      cleanResponse = cleanLines.join("\n").trim()
    }

    // Ensure we have a proper response
    if (!cleanResponse || cleanResponse.length < 50) {
      cleanResponse = generateFallbackResponse(query)
    }

    console.log("Clean response:", cleanResponse)
    console.log("Extracted tasks count:", extractedTasks.length)

    return NextResponse.json({
      success: true,
      data: cleanResponse,
      tasks: extractedTasks,
      sessionId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Travel assistant error:", error)
    return NextResponse.json({ message: error.message || "Failed to process your request" }, { status: 500 })
  }
}

// Fallback function to generate basic tasks when AI parsing fails
function generateFallbackTasks(query) {
  const lowerQuery = query.toLowerCase()
  const tasks = []

  // Check for destination mentions
  const destinations = [
    "bali",
    "paris",
    "new york",
    "tokyo",
    "london",
    "rome",
    "barcelona",
    "dubai",
    "thailand",
    "italy",
    "france",
    "japan",
    "usa",
    "uk",
    "spain",
    "germany",
    "australia",
    "canada",
    "brazil",
    "india",
    "china",
    "mexico",
  ]

  const mentionedDestination = destinations.find((dest) => lowerQuery.includes(dest))
  const destinationName = mentionedDestination
    ? mentionedDestination.charAt(0).toUpperCase() + mentionedDestination.slice(1)
    : "your destination"

  if (
    lowerQuery.includes("visit") ||
    lowerQuery.includes("trip") ||
    lowerQuery.includes("travel") ||
    lowerQuery.includes("plan") ||
    mentionedDestination
  ) {
    tasks.push({
      title: `Research ${destinationName} requirements`,
      description: `Research visa requirements, weather, local customs, and travel advisories for ${destinationName}.`,
      category: "preparation",
      priority: "high",
      suggestedDueDate: "+7 days",
      tips: "Check government travel websites for the most up-to-date information",
    })

    tasks.push({
      title: `Book flights to ${destinationName}`,
      description: "Search and book round-trip flights. Book 2-3 months in advance for better prices.",
      category: "transportation",
      priority: "high",
      suggestedDueDate: "+14 days",
      estimatedCost: "$400-1200",
      tips: "Use flight comparison websites and consider flexible dates",
    })

    tasks.push({
      title: `Reserve accommodation in ${destinationName}`,
      description: "Book hotels or other accommodations for your stay.",
      category: "booking",
      priority: "medium",
      suggestedDueDate: "+21 days",
      estimatedCost: "$100-300 per night",
      tips: "Read reviews and check cancellation policies",
    })

    tasks.push({
      title: "Get travel insurance",
      description: "Purchase comprehensive travel insurance covering medical emergencies and trip cancellation.",
      category: "preparation",
      priority: "medium",
      suggestedDueDate: "+30 days",
      estimatedCost: "$50-150",
      tips: "Compare different providers and coverage options",
    })
  }

  if (lowerQuery.includes("hotel") || lowerQuery.includes("accommodation")) {
    tasks.push({
      title: `Compare hotel options in ${destinationName}`,
      description: "Research and compare different hotels based on location, amenities, and price.",
      category: "booking",
      priority: "medium",
      suggestedDueDate: "+7 days",
      tips: "Consider location, reviews, and included amenities",
    })
  }

  if (lowerQuery.includes("activity") || lowerQuery.includes("things to do") || lowerQuery.includes("attractions")) {
    tasks.push({
      title: `Plan activities in ${destinationName}`,
      description: "Research and book popular activities and attractions at your destination.",
      category: "activities",
      priority: "low",
      suggestedDueDate: "+45 days",
      tips: "Book popular attractions in advance to avoid disappointment",
    })
  }

  if (lowerQuery.includes("visa") || lowerQuery.includes("passport")) {
    tasks.push({
      title: "Check visa requirements",
      description: `Verify if you need a visa for ${destinationName} and apply if necessary.`,
      category: "documents",
      priority: "high",
      suggestedDueDate: "+60 days",
      tips: "Visa processing can take several weeks, apply early",
    })
  }

  return tasks
}

// Generate a fallback response when AI response is too short or contains JSON
function generateFallbackResponse(query) {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("bali")) {
    return "Bali is an incredible destination! You'll love the beautiful beaches, ancient temples, and vibrant culture. The best time to visit is during the dry season (April-October). I recommend staying in Ubud for culture and rice terraces, or Seminyak for beaches and nightlife. Don't miss the sunrise at Mount Batur and the iconic Tanah Lot temple!"
  }

  if (lowerQuery.includes("paris")) {
    return "Paris is the perfect destination for art, culture, and romance! The city offers world-class museums like the Louvre, iconic landmarks like the Eiffel Tower, and amazing cuisine. Spring (April-June) and fall (September-October) are ideal times to visit. Stay in the Marais or Saint-Germain for the best experience."
  }

  if (lowerQuery.includes("new york")) {
    return "New York City is an amazing destination with endless possibilities! From Broadway shows to world-class museums, iconic landmarks like the Statue of Liberty and Empire State Building, and incredible food scenes. The best times to visit are spring and fall when the weather is pleasant."
  }

  if (lowerQuery.includes("tokyo")) {
    return "Tokyo is a fascinating blend of traditional and modern culture! You'll experience everything from ancient temples to cutting-edge technology. Spring (cherry blossom season) and fall are the best times to visit. Don't miss areas like Shibuya, Harajuku, and traditional Asakusa."
  }

  // Generic travel response
  return "That sounds like an exciting travel plan! I'd be happy to help you organize everything you need for a successful trip. Travel planning involves several important steps including research, bookings, documentation, and preparation. Let me help you break this down into manageable tasks."
}
