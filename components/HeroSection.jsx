"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, MapPin, Calendar, Users } from "lucide-react"

export default function HeroSection() {
  const router = useRouter()
  const [destination, setDestination] = useState("")
  const [dates, setDates] = useState("")
  const [guests, setGuests] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    if (destination) {
      // BACKEND_INTEGRATION: You might want to save this search to user history or analytics
      // Example:
      // await fetch('/api/search/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ destination, dates, guests })
      // });

      router.push(`/hotels?location=${destination}&dates=${dates}&guests=${guests}`)
    }
  }

  return (
    <section className="relative h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.jpg?height=1080&width=1920"
          alt="Travel destination"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
      </div>

      {/* Floating Elements Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-20 h-20 bg-white/10 rounded-full animate-float"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/10 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-white/10 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Your Perfect <span className="text-gray-300">Travel Experience</span>
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Let our AI travel assistant help you find the best destinations, hotels, and experiences tailored just for
            you.
          </p>

          {/* Search Form */}
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Check-in - Check-out"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                />
              </div>

              <div className="flex-1 relative">
                <Users className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Guests"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <Search size={20} className="mr-2" />
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
