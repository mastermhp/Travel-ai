import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    console.log("Registration endpoint called")

    const body = await request.json()
    console.log("Request body received:", { email: body.email, hasPassword: !!body.password })

    const { email, password, firstName, lastName, phone } = body

    if (!email || !password || !firstName || !lastName) {
      console.log("Missing required fields:", {
        email: !!email,
        password: !!password,
        firstName: !!firstName,
        lastName: !!lastName,
      })
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    console.log("Attempting to create user with Supabase...")

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
        },
      },
    })

    if (authError) {
      console.error("Supabase auth error:", authError)
      return NextResponse.json(
        {
          message: authError.message,
          details: authError,
        },
        { status: 400 },
      )
    }

    console.log("User created successfully:", authData.user?.id)

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        firstName,
        lastName,
        phone,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
