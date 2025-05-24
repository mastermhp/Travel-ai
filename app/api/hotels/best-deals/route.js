import { searchHotels } from "@/lib/rapidapi"
import { generateTravelResponse } from "@/lib/gemini"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      destination: searchParams.get("destination") || "New York",
      limit: Number.parseInt(searchParams.get("limit")) || 12,
      currency: searchParams.get("currency") || "USD",
    }

    console.log("Getting best hotel deals for:", params.destination)

    try {
      // Try RapidAPI first
      const result = await searchHotels({
        destination: params.destination,
        adults: 2,
        pageNumber: 1,
        currency: params.currency,
      })

      if (result.hotels && result.hotels.length > 0) {
        // Limit results and sort by rating
        const bestDeals = result.hotels.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, params.limit)

        return NextResponse.json({
          ...result,
          hotels: bestDeals,
          count: bestDeals.length,
        })
      }
    } catch (rapidApiError) {
      console.error("RapidAPI best deals failed:", rapidApiError)
    }

    // Fallback to AI-generated data
    console.log("Using AI fallback for best deals")

    const aiPrompt = `Generate ${params.limit} best hotel deals for ${params.destination}. 
    Create a JSON array of hotels with competitive prices and high ratings:
    [
      {
        "id": "unique_id",
        "name": "Hotel Name",
        "location": "Address in ${params.destination}",
        "price": number_between_80_and_300,
        "rating": number_between_4.0_and_4.9,
        "description": "Brief description highlighting value",
        "amenities": ["WiFi", "Breakfast", "Pool", "Gym"],
        "images": ["https://source.unsplash.com/800x600/?hotel+${params.destination.replace(" ", "+")}"]
      }
    ]
    
    Focus on good value hotels with high ratings. Return only the JSON array.`

    const aiResponse = await generateTravelResponse(aiPrompt)

    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (jsonMatch) {
        const hotels = JSON.parse(jsonMatch[0])

        // Add provider and ensure proper structure
        const processedHotels = hotels.map((hotel) => ({
          ...hotel,
          provider: "ai",
          id: hotel.id || `deal-${Math.random().toString(36).substr(2, 9)}`,
        }))

        return NextResponse.json({
          success: true,
          hotels: processedHotels,
          count: processedHotels.length,
          dataSource: "AI Generated Best Deals",
        })
      }
    } catch (parseError) {
      console.error("Failed to parse AI best deals:", parseError)
    }

    // Final fallback
    return NextResponse.json({
      success: true,
      hotels: [],
      count: 0,
      dataSource: "No deals available",
    })
  } catch (error) {
    console.error("Best deals error:", error)
    return NextResponse.json({ message: error.message || "Failed to get best deals" }, { status: 500 })
  }
}
