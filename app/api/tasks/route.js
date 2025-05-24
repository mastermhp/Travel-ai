import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// In-memory storage for tasks (since we don't have a real database table set up)
// In a real app, this would be stored in a database
const tasksStorage = new Map()
const tripsStorage = new Map()

// Initialize with some sample data
if (tasksStorage.size === 0) {
  const sampleTasks = [
    {
      id: 1,
      userId: "sample-user",
      title: "Apply for Visa",
      description: "Apply for tourist visa for Indonesia. Required documents: passport, photos, bank statements.",
      category: "documents",
      priority: "high",
      status: "pending",
      dueDate: "2025-06-01",
      tripId: 1,
      createdAt: "2025-05-20",
      aiGenerated: true,
      source: "AI Travel Assistant",
    },
    {
      id: 2,
      userId: "sample-user",
      title: "Book Flight to Bali",
      description: "Book round-trip flights to Ngurah Rai Airport (DPS). Best time to book is 2-3 months in advance.",
      category: "transportation",
      priority: "high",
      status: "pending",
      dueDate: "2025-05-30",
      tripId: 1,
      createdAt: "2025-05-20",
      aiGenerated: true,
      source: "AI Travel Assistant",
    },
    {
      id: 3,
      userId: "sample-user",
      title: "Book Hotel in Ubud",
      description:
        "Reserve accommodation in Ubud for 3 nights. Look for hotels with rice terrace views and spa services.",
      category: "booking",
      priority: "medium",
      status: "completed",
      dueDate: "2025-05-25",
      tripId: 1,
      createdAt: "2025-05-20",
      aiGenerated: true,
      source: "AI Travel Assistant",
    },
  ]

  sampleTasks.forEach((task) => {
    tasksStorage.set(task.id, task)
  })

  // Sample trips
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
  ]

  sampleTrips.forEach((trip) => {
    tripsStorage.set(trip.id, trip)
  })
}

// Get user's travel tasks
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

    // Get all tasks for this user
    const userTasks = Array.from(tasksStorage.values()).filter((task) => task.userId === userId)

    console.log(`Returning ${userTasks.length} tasks for user ${userId}`)

    return NextResponse.json({
      success: true,
      tasks: userTasks,
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Create new travel task
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

    const taskData = await request.json()

    // Generate a unique ID
    const newId = Math.max(...Array.from(tasksStorage.keys()), 0) + 1

    // Create the new task
    const newTask = {
      id: newId,
      userId: userId,
      ...taskData,
      status: taskData.status || "pending",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString(),
    }

    // Save to storage
    tasksStorage.set(newId, newTask)

    console.log("Created new task:", newTask)

    return NextResponse.json({
      success: true,
      task: newTask,
    })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
