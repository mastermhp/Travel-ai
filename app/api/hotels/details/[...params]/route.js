import { getHotelDetails } from "@/lib/rapidapi"
import { generateTravelResponse } from "@/lib/gemini"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { params: routeParams } = params
    const [provider, hotelId] = routeParams

    if (!hotelId) {
      return NextResponse.json({ message: "Hotel ID is required" }, { status: 400 })
    }

    console.log(`Getting hotel details for ${provider}/${hotelId}`)

    // Try RapidAPI for booking provider
    if (provider === "booking") {
      try {
        const result = await getHotelDetails(hotelId)
        return NextResponse.json(result)
      } catch (rapidApiError) {
        console.error("RapidAPI details failed:", rapidApiError)
      }
    }

    // For AI provider or when RapidAPI fails, generate AI data
    console.log("Using AI fallback for hotel details")

    // Extract location from hotel ID if it contains location info
    let locationHint = ""
    if (hotelId.includes("bali")) locationHint = "Bali, Indonesia"
    else if (hotelId.includes("ny") || hotelId.includes("newyork")) locationHint = "New York, USA"
    else if (hotelId.includes("paris")) locationHint = "Paris, France"
    else if (hotelId.includes("tokyo")) locationHint = "Tokyo, Japan"
    else if (hotelId.includes("london")) locationHint = "London, UK"

    const aiPrompt = `Generate detailed information for a luxury hotel ${locationHint ? `in ${locationHint}` : ""}. 
    Create realistic hotel details in this JSON structure:
    {
      "id": "${hotelId}",
      "name": "Realistic Hotel Name ${locationHint ? `in ${locationHint}` : ""}",
      "location": "Full address ${locationHint ? `in ${locationHint}` : "in a beautiful city"}",
      "price": ${Math.floor(Math.random() * 250) + 150},
      "rating": ${(Math.random() * 0.8 + 4.1).toFixed(1)},
      "description": "Brief description of this beautiful hotel",
      "longDescription": "Detailed 2-3 sentence description highlighting the hotel's unique features, amenities, and location advantages.",
      "amenities": ["Free WiFi", "Swimming Pool", "Spa & Wellness Center", "Restaurant", "Fitness Center", "Room Service", "Concierge", "Parking"],
      "images": [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop"
      ],
      "reviews": [
        {
          "id": 1,
          "user": "Sarah M.",
          "rating": 5,
          "comment": "Absolutely stunning hotel with exceptional service. The staff went above and beyond to make our stay memorable.",
          "date": "2024-01-15"
        },
        {
          "id": 2,
          "user": "Michael R.",
          "rating": 4,
          "comment": "Beautiful property with great amenities. The pool area is fantastic and the location is perfect.",
          "date": "2024-01-10"
        },
        {
          "id": 3,
          "user": "Emma L.",
          "rating": 5,
          "comment": "One of the best hotels I've stayed at. Clean, comfortable, and the breakfast was amazing.",
          "date": "2024-01-08"
        }
      ],
      "rooms": [
        {
          "id": "${hotelId}_deluxe",
          "name": "Deluxe Room",
          "description": "Spacious room with modern amenities and city view",
          "price": ${Math.floor(Math.random() * 100) + 120},
          "capacity": {"adults": 2, "children": 1},
          "images": ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop"]
        },
        {
          "id": "${hotelId}_suite",
          "name": "Executive Suite",
          "description": "Luxurious suite with separate living area and premium amenities",
          "price": ${Math.floor(Math.random() * 150) + 200},
          "capacity": {"adults": 3, "children": 2},
          "images": ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop"]
        },
        {
          "id": "${hotelId}_standard",
          "name": "Standard Room",
          "description": "Comfortable room with all essential amenities",
          "price": ${Math.floor(Math.random() * 80) + 80},
          "capacity": {"adults": 2, "children": 0},
          "images": ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"]
        }
      ]
    }
    
    Make it realistic and appealing. Return only the JSON object, no explanations.`

    const aiResponse = await generateTravelResponse(aiPrompt)

    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const hotel = JSON.parse(jsonMatch[0])

        return NextResponse.json({
          success: true,
          hotel: {
            ...hotel,
            provider: provider || "ai",
          },
          dataSource: "AI Generated",
        })
      }
    } catch (parseError) {
      console.error("Failed to parse AI hotel details:", parseError)
    }

    // Final fallback with hardcoded data
    const fallbackHotel = {
      id: hotelId,
      name: `Premium Hotel ${locationHint || ""}`,
      location: locationHint || "Beautiful Location",
      price: 180,
      rating: 4.5,
      description: "A comfortable and well-appointed hotel perfect for your stay.",
      longDescription:
        "This beautiful hotel offers modern amenities, excellent service, and a prime location. Guests enjoy spacious rooms, delicious dining options, and easy access to local attractions.",
      amenities: ["Free WiFi", "Swimming Pool", "Restaurant", "Fitness Center", "Room Service", "Parking"],
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
      ],
      reviews: [
        {
          id: 1,
          user: "Guest",
          rating: 5,
          comment: "Excellent stay with great service!",
          date: "2024-01-15",
        },
      ],
      rooms: [
        {
          id: `${hotelId}_room1`,
          name: "Standard Room",
          description: "Comfortable room with modern amenities",
          price: 150,
          capacity: { adults: 2, children: 1 },
          images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop"],
        },
      ],
      provider: provider || "ai",
    }

    return NextResponse.json({
      success: true,
      hotel: fallbackHotel,
      dataSource: "AI Generated (Fallback)",
    })
  } catch (error) {
    console.error("Hotel details error:", error)
    return NextResponse.json({ message: error.message || "Failed to get hotel details" }, { status: 500 })
  }
}
