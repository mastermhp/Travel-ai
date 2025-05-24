import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase login error:", error)
      return NextResponse.json({ message: error.message }, { status: 401 })
    }

    const user = data.user
    const session = data.session

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        phone: user.user_metadata?.phone,
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
