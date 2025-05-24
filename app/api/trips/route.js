import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Use the same in-memory storage
const tripsStorage = new Map()

// Initialize with sample data if empty
if (tripsStorage.size === 0) {
  const sampleTrips = [
    {
      id: 1,
      userId: "sample-user",
      name: "Bali Adventure",
      destination: "Bali, Indonesia",
      startDate: "2025-07-01",
      endDate: "2025-07-10",
      status: "planning",
      budget: 2500,
      travelers: 2,
      createdAt: "2025-05-20",
    },
    {
      id: 2,
      userId: "sample-user",
      name: "Paris City Break",
      destination: "Paris, France",
      startDate: "2025-08-15",
      endDate: "2025-08-20",
      status: "idea",
      budget: 1800,
      travelers: 2,
      createdAt: "2025-05-18",
    },
  ]

  sampleTrips.forEach((trip) => {
    tripsStorage.set(trip.id, trip)
  })
}

// Get user's travel trips
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization")
    let userId = "sample-user" // Default for demo

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser(token)

        if (!authError && user) {
          userId = user.id
        }
      } catch (authError) {
        console.log("Auth check failed, using sample user")
      }
    }

    // Get all trips for this user
    const userTrips = Array.from(tripsStorage.values()).filter((trip) => trip.userId === userId)

    console.log(`Returning ${userTrips.length} trips for user ${userId}`)

    return NextResponse.json({
      success: true,
      trips: userTrips,
    })
  } catch (error) {
    console.error("Get trips error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Create new travel trip
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization")
    let userId = "sample-user" // Default for demo

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser(token)

        if (!authError && user) {
          userId = user.id
        }
      } catch (authError) {
        console.log("Auth check failed, using sample user")
      }
    }

    const tripData = await request.json()

    // Generate a unique ID
    const newId = Math.max(...Array.from(tripsStorage.keys()), 0) + 1

    // Create the new trip
    const newTrip = {
      id: newId,
      userId: userId,
      ...tripData,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString(),
    }

    // Save to storage
    tripsStorage.set(newId, newTrip)

    console.log("Created new trip:", newTrip)

    return NextResponse.json({
      success: true,
      trip: newTrip,
    })
  } catch (error) {
    console.error("Create trip error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
