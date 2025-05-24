import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Use the same in-memory storage
const tasksStorage = new Map()

// Update travel task
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const taskId = Number.parseInt(id)
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

    const updateData = await request.json()

    // Get existing task
    const existingTask = tasksStorage.get(taskId)
    if (!existingTask || existingTask.userId !== userId) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    // Update the task
    const updatedTask = {
      ...existingTask,
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    tasksStorage.set(taskId, updatedTask)

    console.log("Updated task:", updatedTask)

    return NextResponse.json({
      success: true,
      task: updatedTask,
    })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Delete travel task
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const taskId = Number.parseInt(id)
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

    // Get existing task
    const existingTask = tasksStorage.get(taskId)
    if (!existingTask || existingTask.userId !== userId) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    // Delete the task
    tasksStorage.delete(taskId)

    console.log("Deleted task:", taskId)

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
