import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)

      // Set the session for this request
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: "", // We don't have refresh token here, but logout should still work
      })
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Supabase logout error:", error)
      // Don't fail the logout even if there's an error
    }

    return NextResponse.json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({
      success: true,
      message: "Logout completed",
    })
  }
}
