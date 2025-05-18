"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  MapPin,
  Star,
  Search,
  Filter,
  Wifi,
  Coffee,
  Tv,
  Utensils,
  ParkingMeterIcon as Parking,
  Snowflake,
} from "lucide-react"

export default function HotelsPage() {
  const searchParams = useSearchParams()
  const locationParam = searchParams.get("location") || ""
  const datesParam = searchParams.get("dates") || ""
  const guestsParam = searchParams.get("guests") || ""

  const [location, setLocation] = useState(locationParam)
  const [dates, setDates] = useState(datesParam)
  const [guests, setGuests] = useState(guestsParam)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [rating, setRating] = useState(0)
  const [amenities, setAmenities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hotels, setHotels] = useState([])

  // BACKEND_INTEGRATION: Replace this mock data with data from your API
  const mockHotels = [
    {
      id: 1,
      name: "Grand Luxury Resort & Spa",
      location: "Bali, Indonesia",
      price: 250,
      rating: 4.8,
      image: "/placeholder.svg?height=300&width=500",
      amenities: ["wifi", "pool", "breakfast", "ac", "restaurant", "parking"],
      description: "Luxurious beachfront resort with stunning ocean views and world-class amenities.",
    },
    {
      id: 2,
      name: "Urban Boutique Hotel",
      location: "Paris, France",
      price: 180,
      rating: 4.6,
      image: "/placeholder.svg?height=300&width=500",
      amenities: ["wifi", "breakfast", "tv", "restaurant"],
      description: "Stylish boutique hotel in the heart of the city, walking distance to major attractions.",
    },
    {
      id: 3,
      name: "Mountain View Lodge",
      location: "Kyoto, Japan",
      price: 150,
      rating: 4.5,
      image: "/placeholder.svg?height=300&width=500",
      amenities: ["wifi", "breakfast", "parking", "tv"],
      description: "Traditional lodge with beautiful mountain views and peaceful surroundings.",
    },
    {
      id: 4,
      name: "Seaside Retreat",
      location: "Santorini, Greece",
      price: 320,
      rating: 4.9,
      image: "/placeholder.svg?height=300&width=500",
      amenities: ["wifi", "pool", "breakfast", "ac", "restaurant", "parking"],
      description: "Stunning cliffside hotel with infinity pools and breathtaking sunset views.",
    },
    {
      id: 5,
      name: "City Center Suites",
      location: "New York, USA",
      price: 280,
      rating: 4.4,
      image: "/placeholder.svg?height=300&width=500",
      amenities: ["wifi", "breakfast", "tv", "ac", "parking"],
      description: "Modern suites in the heart of Manhattan, close to shopping and entertainment.",
    },
    {
      id: 6,
      name: "Historic Boutique Inn",
      location: "Rome, Italy",
      price: 210,
      rating: 4.7,
      image: "/placeholder.svg?height=300&width=500",
      amenities: ["wifi", "breakfast", "tv", "restaurant"],
      description: "Charming hotel in a restored historic building with authentic Italian character.",
    },
  ]

  useEffect(() => {
    // BACKEND_INTEGRATION: Replace with actual hotel search API call
    // Example:
    // const fetchHotels = async () => {
    //   setIsLoading(true);
    //   try {
    //     const queryParams = new URLSearchParams();
    //     if (location) queryParams.append('location', location);
    //     queryParams.append('minPrice', priceRange[0]);
    //     queryParams.append('maxPrice', priceRange[1]);
    //     if (rating > 0) queryParams.append('rating', rating);
    //     if (amenities.length > 0) queryParams.append('amenities', amenities.join(','));
    //
    //     const response = await fetch(`/api/hotels?${queryParams}`);
    //     const data = await response.json();
    //     if (!response.ok) throw new Error(data.message);
    //     setHotels(data);
    //   } catch (error) {
    //     console.error('Error fetching hotels:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchHotels();

    // Simulate API call for now
    setIsLoading(true)
    setTimeout(() => {
      let filteredHotels = [...mockHotels]

      // Filter by location if provided
      if (location) {
        filteredHotels = filteredHotels.filter((hotel) => hotel.location.toLowerCase().includes(location.toLowerCase()))
      }

      // Filter by price range
      filteredHotels = filteredHotels.filter((hotel) => hotel.price >= priceRange[0] && hotel.price <= priceRange[1])

      // Filter by rating
      if (rating > 0) {
        filteredHotels = filteredHotels.filter((hotel) => hotel.rating >= rating)
      }

      // Filter by amenities
      if (amenities.length > 0) {
        filteredHotels = filteredHotels.filter((hotel) =>
          amenities.every((amenity) => hotel.amenities.includes(amenity)),
        )
      }

      setHotels(filteredHotels)
      setIsLoading(false)
    }, 1000)
  }, [location, priceRange, rating, amenities])

  const handleSearch = (e) => {
    e.preventDefault()
    // The useEffect will handle the filtering
  }

  const handleAmenityToggle = (amenity) => {
    setAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "breakfast":
        return <Coffee className="h-4 w-4" />
      case "tv":
        return <Tv className="h-4 w-4" />
      case "restaurant":
        return <Utensils className="h-4 w-4" />
      case "parking":
        return <Parking className="h-4 w-4" />
      case "ac":
        return <Snowflake className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Find Your Perfect Stay</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h2>

              <form onSubmit={handleSearch}>
                <div className="mb-4">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Where are you going?"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">${priceRange[0]}</span>
                    <span className="text-sm text-gray-500">${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex space-x-2">
                    {[0, 3, 3.5, 4, 4.5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`px-3 py-1 rounded-full text-sm ${
                          rating === value ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setRating(value)}
                      >
                        {value === 0 ? "Any" : `${value}+`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                  <div className="space-y-2">
                    {[
                      { id: "wifi", label: "WiFi", icon: <Wifi className="h-4 w-4" /> },
                      { id: "breakfast", label: "Breakfast", icon: <Coffee className="h-4 w-4" /> },
                      { id: "tv", label: "TV", icon: <Tv className="h-4 w-4" /> },
                      { id: "restaurant", label: "Restaurant", icon: <Utensils className="h-4 w-4" /> },
                      { id: "parking", label: "Parking", icon: <Parking className="h-4 w-4" /> },
                      { id: "ac", label: "Air Conditioning", icon: <Snowflake className="h-4 w-4" /> },
                    ].map((amenity) => (
                      <div key={amenity.id} className="flex items-center">
                        <input
                          id={amenity.id}
                          type="checkbox"
                          checked={amenities.includes(amenity.id)}
                          onChange={() => handleAmenityToggle(amenity.id)}
                          className="h-4 w-4 text-black focus:ring-gray-500 border-gray-300 rounded"
                        />
                        <label htmlFor={amenity.id} className="ml-2 flex items-center text-sm text-gray-700">
                          {amenity.icon}
                          <span className="ml-1">{amenity.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Hotel Listings */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : hotels.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-bold mb-2">No hotels found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search filters or exploring a different location.
                </p>
                <button
                  onClick={() => {
                    setLocation("")
                    setPriceRange([0, 1000])
                    setRating(0)
                    setAmenities([])
                  }}
                  className="text-black font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotels.map((hotel) => (
                  <Link href={`/hotels/${hotel.id}`} key={hotel.id}>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full transition-transform duration-300 hover:scale-[1.02]">
                      <div className="relative h-48">
                        <Image src={hotel.image || "/placeholder.svg"} alt={hotel.name} fill className="object-cover" />
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold">{hotel.name}</h3>
                          <div className="flex items-center bg-black text-white px-2 py-1 rounded-full text-sm">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {hotel.rating}
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{hotel.location}</span>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">{hotel.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.slice(0, 4).map((amenity) => (
                            <div
                              key={amenity}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center"
                            >
                              {getAmenityIcon(amenity)}
                              <span className="ml-1 capitalize">{amenity}</span>
                            </div>
                          ))}
                          {hotel.amenities.length > 4 && (
                            <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                              +{hotel.amenities.length - 4} more
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xl font-bold text-black">${hotel.price}</span>
                            <span className="text-gray-500 text-sm"> / night</span>
                          </div>
                          <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
