"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
  AlertTriangle,
  Eye,
  ImageIcon,
  Camera,
} from "lucide-react"
import apiService from "@/services/api"
import SafeImage from "@/components/SafeImage"

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
  const [dataSource, setDataSource] = useState("")
  const [error, setError] = useState(null)
  const [searchTrigger, setSearchTrigger] = useState(0)

  // Fetch hotels from API
  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const destination = location || "New York"
        console.log("Fetching hotels for:", destination)

        // Get best deals or search for specific location
        let hotelsData

        try {
          // Try the search endpoint specifically to honor the location filter
          const searchResponse = await apiService.searchHotels({
            destination,
            adults: Number.parseInt(guests) || 2,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            rating: rating > 0 ? rating : undefined,
          })

          hotelsData = searchResponse

          // If no hotels found with search, try best deals
          if (!hotelsData.hotels || hotelsData.hotels.length === 0) {
            console.log("No hotels found in search, trying best deals")
            const bestDealsResponse = await apiService.getBestHotelDeals({
              destination,
              limit: 12,
              currency: "USD",
            })

            hotelsData = bestDealsResponse
          }
        } catch (searchError) {
          console.error("Error searching for hotels:", searchError)

          // Fall back to best deals
          const bestDealsResponse = await apiService.getBestHotelDeals({
            destination,
            limit: 12,
            currency: "USD",
          })

          hotelsData = bestDealsResponse
        }

        if (hotelsData && hotelsData.hotels) {
          // Set the data source info
          setDataSource(hotelsData.dataSource || "API")

          // Process hotels data
          let hotelsList = hotelsData.hotels

          // Additional location filtering on client side (to be extra sure)
          if (destination && destination.trim() !== "") {
            const searchTerms = destination.toLowerCase().trim().split(/\s+/)

            // Filter hotels by location if search term is provided
            // Make this a loose match to ensure we get results
            hotelsList = hotelsList.filter((hotel) => {
              const hotelLocation = (hotel.location || hotel.address || "").toLowerCase()

              // Check if ANY of the search terms match the hotel location
              return searchTerms.some((term) => hotelLocation.includes(term))
            })

            // If no hotels found after filtering, use all hotels but sort by relevance
            if (hotelsList.length === 0) {
              console.log("No exact location matches, using all results sorted by relevance")
              hotelsList = hotelsData.hotels

              // Sort by location relevance
              hotelsList.sort((a, b) => {
                const locA = (a.location || a.address || "").toLowerCase()
                const locB = (b.location || b.address || "").toLowerCase()

                // Count matching terms in location
                const matchScoreA = searchTerms.reduce((score, term) => score + (locA.includes(term) ? 1 : 0), 0)
                const matchScoreB = searchTerms.reduce((score, term) => score + (locB.includes(term) ? 1 : 0), 0)

                return matchScoreB - matchScoreA
              })
            }
          }

          // Filter by amenities if needed
          if (amenities.length > 0) {
            hotelsList = hotelsList.filter((hotel) => {
              // Check if hotel has the amenities array
              if (!hotel.amenities || !Array.isArray(hotel.amenities)) {
                return false
              }

              // Convert hotel amenities to lowercase strings for comparison
              const hotelAmenitiesLower = hotel.amenities.map((a) => (typeof a === "string" ? a.toLowerCase() : ""))

              // Check if all selected amenities are included
              return amenities.every((amenity) => {
                const amenityLower = amenity.toLowerCase()
                return hotelAmenitiesLower.some((a) => a.includes(amenityLower))
              })
            })
          }

          setHotels(hotelsList)
        } else {
          setError("No hotels found. Please try a different search.")
        }
      } catch (error) {
        console.error("Error fetching hotels:", error)
        setError(error.message || "Failed to load hotels. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotels()
  }, [searchTrigger])

  const handleSearch = (e) => {
    e.preventDefault()
    // Increment search trigger to force a new search with current filters
    setSearchTrigger((prevTrigger) => prevTrigger + 1)
  }

  const handleAmenityToggle = (amenity) => {
    setAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const getAmenityIcon = (amenity) => {
    const amenityLower = typeof amenity === "string" ? amenity.toLowerCase() : ""

    if (amenityLower.includes("wifi")) return <Wifi className="h-4 w-4" />
    if (amenityLower.includes("breakfast")) return <Coffee className="h-4 w-4" />
    if (amenityLower.includes("tv")) return <Tv className="h-4 w-4" />
    if (amenityLower.includes("restaurant")) return <Utensils className="h-4 w-4" />
    if (amenityLower.includes("parking")) return <Parking className="h-4 w-4" />
    if (amenityLower.includes("air") || amenityLower.includes("ac")) return <Snowflake className="h-4 w-4" />

    return null
  }

  // Helper function to get hotel image URLs - now uses enhanced images
  const getHotelImageUrl = (hotel) => {
    if (!hotel) return "/placeholder.svg"

    // Use the enhanced image from the new service
    if (hotel.image && typeof hotel.image === "string") {
      return hotel.image
    }

    // Fallback to first image in images array
    if (hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0) {
      return hotel.images[0]
    }

    // Final fallback
    return "/placeholder.svg"
  }

  // Get image source badge text with better descriptions
  const getImageSourceBadge = (hotel) => {
    if (hotel.imageSource === "Enhanced Search") return "Smart Images"
    if (hotel.imageSource === "API + Enhanced") return "Real + Smart"
    if (hotel.imageSource === "API Only") return "Official"
    if (hotel.imageSource === "Enhanced Fallback") return "Curated"
    return "Enhanced"
  }

  // Get badge color based on image source
  const getBadgeColor = (hotel) => {
    if (hotel.imageSource === "API + Enhanced") return "bg-green-500"
    if (hotel.imageSource === "Enhanced Search") return "bg-blue-500"
    if (hotel.imageSource === "API Only") return "bg-purple-500"
    return "bg-orange-500"
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
                  Search Hotels
                </button>
              </form>
            </div>
          </div>

          {/* Hotel Listings */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
                <p className="text-gray-600">Searching hotels and enhancing images...</p>
                <p className="text-sm text-gray-500 mt-2">Finding the best photos for each property</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-red-500 mb-4">
                  <AlertTriangle className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-bold mb-2">Error loading hotels</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setLocation("")
                    setPriceRange([0, 1000])
                    setRating(0)
                    setAmenities([])
                    setSearchTrigger((prev) => prev + 1)
                  }}
                  className="text-black font-medium hover:underline"
                >
                  Clear filters and try again
                </button>
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
                    setSearchTrigger((prev) => prev + 1)
                  }}
                  className="text-black font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* Enhanced image info */}
                <div className="mb-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 flex items-center">
                  <Camera className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      <strong>Enhanced Hotel Images:</strong> Smart image selection using hotel names and locations
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Each hotel shows curated images specific to the property and brand
                    </p>
                  </div>
                </div>

                {/* Show location if searching */}
                {location && (
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">
                      Hotels in {location} ({hotels.length} found)
                    </h2>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hotels.map((hotel) => (
                    <div
                      key={`${hotel.provider || "booking"}-${hotel.id}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden h-full transition-transform duration-300 hover:scale-[1.02]"
                    >
                      <div className="relative h-48">
                        <SafeImage
                          src={getHotelImageUrl(hotel)}
                          alt={`${hotel.name} - Enhanced Hotel Image`}
                          fill
                          className="object-cover"
                          fallbackSrc={`https://source.unsplash.com/800x600/?${encodeURIComponent(hotel.name)}+hotel+luxury`}
                        />
                        {/* Rating badge */}
                        <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 rounded-full text-sm flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {typeof hotel.rating === "number" ? hotel.rating.toFixed(1) : "4.0"}
                        </div>
                        {/* Enhanced image source badge */}
                        <div
                          className={`absolute top-4 left-4 ${getBadgeColor(hotel)} text-white px-2 py-1 rounded-full text-xs font-medium flex items-center`}
                        >
                          <Camera className="h-3 w-3 mr-1" />
                          {getImageSourceBadge(hotel)}
                        </div>
                        {/* Image count indicator */}
                        {hotel.images && hotel.images.length > 1 && (
                          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            {hotel.images.length} photos
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold line-clamp-2">{hotel.name}</h3>
                        </div>

                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="text-sm line-clamp-1">
                            {hotel.address || hotel.location || "Location information unavailable"}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {hotel.description || "Experience a comfortable stay at this property"}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {(Array.isArray(hotel.amenities) ? hotel.amenities : []).slice(0, 4).map((amenity, idx) => (
                            <div
                              key={`${amenity}-${idx}`}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center"
                            >
                              {getAmenityIcon(amenity)}
                              <span className="ml-1 capitalize">{typeof amenity === "string" ? amenity : ""}</span>
                            </div>
                          ))}
                          {Array.isArray(hotel.amenities) && hotel.amenities.length > 4 && (
                            <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                              +{hotel.amenities.length - 4} more
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xl font-bold text-black">
                              $
                              {typeof hotel.price === "number"
                                ? hotel.price.toFixed(0)
                                : typeof hotel.price === "string" && !isNaN(Number.parseFloat(hotel.price))
                                  ? Number.parseFloat(hotel.price).toFixed(0)
                                  : "0"}
                            </span>
                            <span className="text-gray-500 text-sm"> / night</span>
                            {hotel.reviewCount && (
                              <div className="text-xs text-gray-500 mt-1">{hotel.reviewCount} reviews</div>
                            )}
                          </div>
                          <Link
                            href={`/hotels/${hotel.id}`}
                            // href={`/hotels/${hotel.provider || "booking"}/${hotel.id}`}
                            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
