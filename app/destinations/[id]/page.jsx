"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Star, Clock, Calendar, Users, Camera, ChevronLeft, Heart, Share2, CheckCircle } from "lucide-react"

export default function DestinationDetailPage() {
  const params = useParams()
  const { id } = params
  const [destination, setDestination] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  // Sample destination data
  const destinationData = {
    1: {
      id: 1,
      name: "Bali, Indonesia",
      category: "beach",
      images: [
        "/placeholder.svg?height=600&width=800",
        "/placeholder.svg?height=600&width=800",
        "/placeholder.svg?height=600&width=800",
        "/placeholder.svg?height=600&width=800",
      ],
      description:
        "Bali is a tropical paradise that offers a perfect blend of stunning natural beauty, rich cultural heritage, and modern amenities. Known as the 'Island of the Gods,' Bali captivates visitors with its lush rice terraces, pristine beaches, ancient temples, and vibrant arts scene.",
      rating: 4.8,
      reviewCount: 2847,
      duration: "7-10 days",
      bestTime: "April - October",
      highlights: [
        "Ubud Rice Terraces",
        "Tanah Lot Temple",
        "Seminyak Beach",
        "Mount Batur Sunrise Trek",
        "Monkey Forest Sanctuary",
        "Traditional Balinese Spa",
      ],
      price: "$1,200",
      country: "Indonesia",
      continent: "Asia",
      activities: [
        {
          name: "Temple Hopping Tour",
          duration: "Full Day",
          price: "$45",
          description: "Visit the most sacred temples including Tanah Lot and Uluwatu",
        },
        {
          name: "Rice Terrace Cycling",
          duration: "Half Day",
          price: "$35",
          description: "Cycle through stunning rice terraces in Ubud",
        },
        {
          name: "Mount Batur Sunrise Trek",
          duration: "Early Morning",
          price: "$55",
          description: "Hike to the summit for breathtaking sunrise views",
        },
        {
          name: "Balinese Cooking Class",
          duration: "4 Hours",
          price: "$40",
          description: "Learn to cook authentic Balinese dishes",
        },
      ],
      accommodation: [
        {
          name: "Luxury Beach Resort",
          type: "5-star",
          priceRange: "$200-400/night",
          features: ["Beachfront", "Spa", "Pool", "Restaurant"],
        },
        {
          name: "Boutique Villa",
          type: "4-star",
          priceRange: "$100-200/night",
          features: ["Private Pool", "Garden View", "Kitchen", "WiFi"],
        },
        {
          name: "Budget Hostel",
          type: "Budget",
          priceRange: "$15-30/night",
          features: ["Shared Kitchen", "WiFi", "Common Area", "Tours"],
        },
      ],
      transportation: {
        flight: "International flights to Ngurah Rai Airport (DPS)",
        local: "Scooter rental, private driver, or taxi",
        tips: "Rent a scooter for flexibility, but be cautious of traffic",
      },
      culture: {
        language: "Indonesian, Balinese",
        currency: "Indonesian Rupiah (IDR)",
        religion: "Hindu majority",
        customs: "Dress modestly when visiting temples, remove shoes before entering",
      },
      weather: {
        drySeasonn: "April - October (Best time to visit)",
        wetSeason: "November - March (Occasional rain, fewer crowds)",
        temperature: "26-30°C (79-86°F) year-round",
      },
    },
    // Add more destinations as needed
  }

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const dest = destinationData[id]
      if (dest) {
        setDestination(dest)
      }
      setIsLoading(false)
    }, 1000)
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Destination Not Found</h2>
          <p className="text-gray-600 mb-4">The destination you're looking for doesn't exist.</p>
          <Link href="/destinations" className="text-black hover:underline">
            Browse all destinations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/destinations" className="inline-flex items-center text-black hover:underline mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to destinations
        </Link>

        {/* Image Gallery */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="md:col-span-2">
              <div className="relative h-80 md:h-96 rounded-lg overflow-hidden">
                <Image
                  src={destination.images[selectedImageIndex] || "/placeholder.svg"}
                  alt={destination.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`p-2 rounded-full ${
                      isFavorited ? "bg-red-500 text-white" : "bg-white/80 text-gray-700"
                    } hover:bg-red-500 hover:text-white transition-colors`}
                  >
                    <Heart className="h-5 w-5" fill={isFavorited ? "currentColor" : "none"} />
                  </button>
                  <button className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              {destination.images.slice(0, 3).map((image, index) => (
                <div
                  key={index}
                  className={`relative h-24 md:h-28 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedImageIndex === index ? "ring-2 ring-black" : "opacity-80 hover:opacity-100"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${destination.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {destination.images.length > 3 && (
                <div
                  className="relative h-24 md:h-28 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedImageIndex(3)}
                >
                  <Image
                    src={destination.images[3] || "/placeholder.svg"}
                    alt={`${destination.name} - Image 4`}
                    fill
                    className="object-cover group-hover:opacity-75 transition-opacity"
                  />
                  {destination.images.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-medium">
                      <Camera className="h-5 w-5 mr-1" />+{destination.images.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{destination.name}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-1" />
                    <span>
                      {destination.country}, {destination.continent}
                    </span>
                  </div>
                </div>
                <div className="flex items-center bg-black text-white px-3 py-2 rounded-lg">
                  <Star className="h-5 w-5 mr-1 fill-current" />
                  <span className="font-bold">{destination.rating}</span>
                  <span className="ml-1 text-sm">({destination.reviewCount} reviews)</span>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{destination.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-black" />
                  <div>
                    <div className="font-medium">Duration</div>
                    <div className="text-sm text-gray-600">{destination.duration}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-black" />
                  <div>
                    <div className="font-medium">Best Time</div>
                    <div className="text-sm text-gray-600">{destination.bestTime}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-black" />
                  <div>
                    <div className="font-medium">Perfect For</div>
                    <div className="text-sm text-gray-600">All travelers</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">Top Highlights</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {destination.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Popular Activities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {destination.activities.map((activity, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{activity.name}</h3>
                      <span className="text-lg font-bold text-black">{activity.price}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{activity.duration}</div>
                    <p className="text-gray-700 text-sm">{activity.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Accommodation */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Where to Stay</h2>
              <div className="space-y-4">
                {destination.accommodation.map((hotel, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{hotel.name}</h3>
                        <span className="text-sm text-gray-600">{hotel.type}</span>
                      </div>
                      <span className="font-bold text-black">{hotel.priceRange}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hotel.features.map((feature, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Quick Info</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Transportation</h4>
                  <p className="text-sm text-gray-600 mb-1">{destination.transportation.flight}</p>
                  <p className="text-sm text-gray-600">{destination.transportation.local}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Culture & Language</h4>
                  <p className="text-sm text-gray-600 mb-1">Language: {destination.culture.language}</p>
                  <p className="text-sm text-gray-600 mb-1">Currency: {destination.culture.currency}</p>
                  <p className="text-sm text-gray-600">{destination.culture.customs}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Weather</h4>
                  <p className="text-sm text-gray-600 mb-1">{destination.weather.drySeasonn}</p>
                  <p className="text-sm text-gray-600 mb-1">{destination.weather.wetSeason}</p>
                  <p className="text-sm text-gray-600">Avg: {destination.weather.temperature}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href={`/hotels?location=${encodeURIComponent(destination.name)}`}
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-lg text-center block transition-colors"
                >
                  Find Hotels
                </Link>
                <Link
                  href={`/chat?destination=${encodeURIComponent(destination.name)}`}
                  className="w-full border border-black text-black hover:bg-gray-50 py-3 px-4 rounded-lg text-center block transition-colors"
                >
                  Plan with AI
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
