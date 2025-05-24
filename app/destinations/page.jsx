"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Star, Clock, Users, Search } from "lucide-react"

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([])
  const [filteredDestinations, setFilteredDestinations] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Sample destinations data
  const destinationsData = [
    {
      id: 1,
      name: "Bali, Indonesia",
      category: "beach",
      image: "/placeholder.svg?height=400&width=600",
      description: "Tropical paradise with stunning beaches, ancient temples, and vibrant culture",
      rating: 4.8,
      duration: "7-10 days",
      bestTime: "Apr-Oct",
      highlights: ["Ubud Rice Terraces", "Tanah Lot Temple", "Seminyak Beach", "Mount Batur"],
      price: "$1,200",
      country: "Indonesia",
    },
    {
      id: 2,
      name: "Santorini, Greece",
      category: "island",
      image: "/placeholder.svg?height=400&width=600",
      description: "Iconic white-washed buildings overlooking the deep blue Aegean Sea",
      rating: 4.9,
      duration: "4-6 days",
      bestTime: "May-Sep",
      highlights: ["Oia Sunset", "Red Beach", "Akrotiri", "Wine Tasting"],
      price: "$1,800",
      country: "Greece",
    },
    {
      id: 3,
      name: "Kyoto, Japan",
      category: "cultural",
      image: "/placeholder.svg?height=400&width=600",
      description: "Ancient capital with thousands of temples, traditional gardens, and geishas",
      rating: 4.7,
      duration: "5-7 days",
      bestTime: "Mar-May, Sep-Nov",
      highlights: ["Fushimi Inari Shrine", "Bamboo Grove", "Kiyomizu Temple", "Gion District"],
      price: "$1,500",
      country: "Japan",
    },
    {
      id: 4,
      name: "Paris, France",
      category: "city",
      image: "/placeholder.svg?height=400&width=600",
      description: "City of Light with world-class museums, cuisine, and romantic atmosphere",
      rating: 4.6,
      duration: "4-7 days",
      bestTime: "Apr-Jun, Sep-Oct",
      highlights: ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Champs-Élysées"],
      price: "$1,400",
      country: "France",
    },
    {
      id: 5,
      name: "Machu Picchu, Peru",
      category: "adventure",
      image: "/placeholder.svg?height=400&width=600",
      description: "Ancient Incan citadel high in the Andes Mountains",
      rating: 4.9,
      duration: "3-5 days",
      bestTime: "May-Sep",
      highlights: ["Inca Trail", "Huayna Picchu", "Sacred Valley", "Cusco"],
      price: "$1,100",
      country: "Peru",
    },
    {
      id: 6,
      name: "Maldives",
      category: "beach",
      image: "/placeholder.svg?height=400&width=600",
      description: "Tropical paradise with crystal-clear waters and overwater bungalows",
      rating: 4.8,
      duration: "5-8 days",
      bestTime: "Nov-Apr",
      highlights: ["Overwater Villas", "Coral Reefs", "Dolphin Watching", "Spa Treatments"],
      price: "$2,500",
      country: "Maldives",
    },
    {
      id: 7,
      name: "Dubai, UAE",
      category: "city",
      image: "/placeholder.svg?height=400&width=600",
      description: "Modern metropolis with luxury shopping, ultramodern architecture",
      rating: 4.5,
      duration: "4-6 days",
      bestTime: "Nov-Mar",
      highlights: ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah", "Desert Safari"],
      price: "$1,600",
      country: "UAE",
    },
    {
      id: 8,
      name: "Iceland",
      category: "adventure",
      image: "/placeholder.svg?height=400&width=600",
      description: "Land of fire and ice with glaciers, geysers, and northern lights",
      rating: 4.7,
      duration: "7-10 days",
      bestTime: "Jun-Aug, Sep-Mar",
      highlights: ["Blue Lagoon", "Golden Circle", "Northern Lights", "Glacier Hiking"],
      price: "$2,000",
      country: "Iceland",
    },
  ]

  const categories = [
    { id: "all", name: "All Destinations" },
    { id: "beach", name: "Beach" },
    { id: "city", name: "City" },
    { id: "cultural", name: "Cultural" },
    { id: "adventure", name: "Adventure" },
    { id: "island", name: "Island" },
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setDestinations(destinationsData)
      setFilteredDestinations(destinationsData)
      setIsLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = destinations

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((dest) => dest.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredDestinations(filtered)
  }, [destinations, selectedCategory, searchTerm])

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover Amazing Destinations</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore the world's most beautiful places and create unforgettable memories
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search destinations..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? "s" : ""}
            {selectedCategory !== "all" && ` in ${categories.find((c) => c.id === selectedCategory)?.name}`}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <MapPin className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-2">No destinations found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
              }}
              className="text-black font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((destination) => (
              <Link href={`/destinations/${destination.id}`} key={destination.id}>
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full">
                  <div className="relative h-48">
                    <Image
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                      {destination.rating}
                    </div>
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {destination.category}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{destination.name}</h3>
                      <span className="text-lg font-bold text-black">{destination.price}</span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{destination.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {destination.duration} • Best: {destination.bestTime}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Perfect for couples and families</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {destination.highlights.slice(0, 3).map((highlight, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {highlight}
                        </span>
                      ))}
                      {destination.highlights.length > 3 && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          +{destination.highlights.length - 3} more
                        </span>
                      )}
                    </div>

                    <button className="w-full bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-lg transition-colors">
                      Explore Destination
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
