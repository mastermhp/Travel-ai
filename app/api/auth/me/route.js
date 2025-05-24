import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No authorization token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        phone: user.user_metadata?.phone,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
