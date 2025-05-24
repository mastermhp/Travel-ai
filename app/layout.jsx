// app/layout.jsx
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import { AuthProvider } from "@/context/AuthContext" // Add this import

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TravelBuddy - Your AI Travel Companion",
  description: "Find the perfect destination, hotels, and travel recommendations with our AI-powered travel assistant.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}