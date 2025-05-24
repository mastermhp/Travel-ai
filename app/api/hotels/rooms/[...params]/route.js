import { getHotelRooms } from "@/lib/rapidapi"
import { generateTravelResponse } from "@/lib/gemini"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { params: routeParams } = params
    const [provider, hotelId] = routeParams
    const { searchParams } = new URL(request.url)

    const roomParams = {
      adults: Number.parseInt(searchParams.get("adults")) || 2,
      children: Number.parseInt(searchParams.get("children")) || 0,
      roomQty: Number.parseInt(searchParams.get("roomQty")) || 1,
    }

    if (!hotelId) {
      return NextResponse.json({ message: "Hotel ID is required" }, { status: 400 })
    }

    console.log(`Getting rooms for ${provider}/${hotelId}`)

    // Try RapidAPI for booking provider
    if (provider === "booking") {
      try {
        const result = await getHotelRooms(hotelId, roomParams)
        return NextResponse.json(result)
      } catch (rapidApiError) {
        console.error("RapidAPI rooms failed:", rapidApiError)
      }
    }

    // Fallback to AI-generated room data
    console.log("Using AI fallback for hotel rooms")

    const aiPrompt = `Generate realistic room options for hotel ID "${hotelId}". 
    Create a JSON array of 3-5 different room types:
    [
      {
        "id": "room1",
        "name": "Standard Room",
        "description": "Comfortable room with modern amenities",
        "price": number_between_120_and_200,
        "capacity": {"adults": 2, "children": 1},
        "images": ["https://source.unsplash.com/800x600/?hotel+room+standard"],
        "amenities": ["WiFi", "TV", "Air Conditioning", "Mini Bar"]
      }
    ]
    
    Return only the JSON array, no explanations.`

    const aiResponse = await generateTravelResponse(aiPrompt)

    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (jsonMatch) {
        const rooms = JSON.parse(jsonMatch[0])

        return NextResponse.json({
          success: true,
          rooms,
          dataSource: "AI Generated",
        })
      }
    } catch (parseError) {
      console.error("Failed to parse AI room data:", parseError)
    }

    // Final fallback - return empty rooms
    return NextResponse.json({
      success: true,
      rooms: [],
      dataSource: "No rooms available",
    })
  } catch (error) {
    console.error("Hotel rooms error:", error)
    return NextResponse.json({ message: error.message || "Failed to get hotel rooms" }, { status: 500 })
  }
}
