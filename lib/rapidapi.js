const RAPIDAPI_KEY = process.env.RAPID_API_KEY
const RAPIDAPI_HOST = "booking-com15.p.rapidapi.com"

// Import enhanced hotel image service
import { getHotelImages } from "./hotelImageService.js"

if (!RAPIDAPI_KEY) {
  console.warn("RAPID_API_KEY is not set - using AI fallback for hotel data")
}

const rapidApiHeaders = {
  "X-RapidAPI-Key": RAPIDAPI_KEY,
  "X-RapidAPI-Host": RAPIDAPI_HOST,
  "Content-Type": "application/json",
}

// Reduced timeout for faster fallback
async function fetchWithTimeout(url, options, timeout = 8000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === "AbortError") {
      throw new Error("Request timeout - API took too long to respond")
    }
    throw error
  }
}

export async function searchHotels(params) {
  // Return early if no API key
  if (!RAPIDAPI_KEY) {
    throw new Error("RapidAPI key not configured")
  }

  try {
    const {
      destination = "New York",
      checkIn,
      checkOut,
      adults = 2,
      children = 0,
      pageNumber = 1,
      currency = "USD",
    } = params

    const url = `https://${RAPIDAPI_HOST}/api/v1/hotels/searchHotels`

    const queryParams = new URLSearchParams({
      dest_id: destination,
      search_type: "city",
      arrival_date: checkIn || new Date().toISOString().split("T")[0],
      departure_date: checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      adults: adults.toString(),
      children: children.toString(),
      room_qty: "1",
      page_number: pageNumber.toString(),
      languagecode: "en-us",
      currency_code: currency,
    })

    console.log("Searching hotels with URL:", `${url}?${queryParams}`)

    const response = await fetchWithTimeout(
      `${url}?${queryParams}`,
      {
        method: "GET",
        headers: rapidApiHeaders,
      },
      8000,
    )

    if (!response.ok) {
      throw new Error(`RapidAPI request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Raw API response:", data)

    // Transform the data with enhanced image service
    const hotelsWithImages = await Promise.all(
      (data.data?.hotels || []).map(async (hotel) => {
        const hotelName = hotel.hotel_name || hotel.name || "Hotel"
        const hotelLocation = hotel.address || hotel.location || destination

        // Get API images
        const apiImages = hotel.photos
          ? hotel.photos.map((p) => p.url_original || p.url_max300 || p.url)
          : [hotel.main_photo_url].filter(Boolean)

        // Get enhanced images using the new service
        const imageData = await getHotelImages(hotelName, hotelLocation, apiImages)

        return {
          id: hotel.hotel_id || hotel.id,
          name: hotelName,
          location: hotelLocation,
          price: hotel.min_total_price || hotel.price || 0,
          rating: hotel.review_score || hotel.rating || 4.0,
          reviewCount: hotel.review_nr || hotel.reviewCount || 0,
          // Use enhanced main image
          image: imageData.mainImage,
          // Use all enhanced images
          images: imageData.allImages,
          imageSource: imageData.source,
          imageDetails: imageData.imageDetails,
          searchTerms: imageData.searchTerms,
          description:
            hotel.hotel_description || hotel.description || "Comfortable accommodation with modern amenities",
          amenities: hotel.facilities || hotel.amenities || ["WiFi", "Air Conditioning"],
          provider: "booking",
          // Additional details for better display
          currency: hotel.currency_code || currency,
          priceBreakdown: hotel.price_breakdown,
          distanceFromCenter: hotel.distance_to_cc,
          hotelClass: hotel.class || hotel.hotel_class,
        }
      }),
    )

    console.log("Processed hotels with enhanced images:", hotelsWithImages)

    return {
      success: true,
      hotels: hotelsWithImages,
      count: hotelsWithImages.length,
      dataSource: "Booking.com API + Enhanced Images",
    }
  } catch (error) {
    console.error("RapidAPI hotel search error:", error)
    throw error
  }
}

export async function getHotelDetails(hotelId) {
  if (!RAPIDAPI_KEY) {
    throw new Error("RapidAPI key not configured")
  }

  try {
    const url = `https://${RAPIDAPI_HOST}/api/v1/hotels/getHotelDetails`

    const queryParams = new URLSearchParams({
      hotel_id: hotelId,
      languagecode: "en-us",
      currency_code: "USD",
    })

    console.log("Fetching hotel details:", `${url}?${queryParams}`)

    const response = await fetchWithTimeout(
      `${url}?${queryParams}`,
      {
        method: "GET",
        headers: rapidApiHeaders,
      },
      8000,
    )

    if (!response.ok) {
      throw new Error(`RapidAPI request failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("Hotel details raw response:", data)

    if (!data.data) {
      throw new Error("Hotel not found")
    }

    const hotel = data.data
    const hotelName = hotel.hotel_name || hotel.name || "Hotel"
    const hotelLocation = hotel.address || hotel.full_address || ""

    // Get API images
    const apiImages = hotel.photos
      ? hotel.photos.map((p) => p.url_original || p.url_max300 || p.url || p.photo_url)
      : []

    // Get enhanced images using the new service
    const imageData = await getHotelImages(hotelName, hotelLocation, apiImages)

    // Process facilities/amenities
    const processFacilities = (facilities) => {
      if (!facilities || !Array.isArray(facilities)) return []
      return facilities
        .map((facility) => {
          if (typeof facility === "string") return facility
          return facility.name || facility.facility_name || facility
        })
        .filter(Boolean)
    }

    // Process reviews
    const processReviews = (reviews) => {
      if (!reviews || !Array.isArray(reviews)) return []
      return reviews.slice(0, 5).map((review, index) => ({
        id: review.review_id || index,
        user: review.author || review.reviewer_name || `Guest ${index + 1}`,
        rating: review.average_score || review.rating || 4,
        comment: review.content || review.review_text || review.comment || "Great stay!",
        date: review.date || review.review_date || new Date().toISOString().split("T")[0],
        userInfo: {
          name: review.author || review.reviewer_name || `Guest ${index + 1}`,
          country: review.reviewer_country || review.country,
        },
      }))
    }

    const processedHotel = {
      id: hotel.hotel_id || hotelId,
      name: hotelName,
      location: hotelLocation,
      address: hotelLocation,
      price: hotel.min_total_price || hotel.price || 0,
      rating: hotel.review_score || hotel.rating || 4.0,
      reviewCount: hotel.review_nr || hotel.number_of_reviews || 0,
      images: imageData.allImages,
      imageSource: imageData.source,
      imageDetails: imageData.imageDetails,
      description:
        hotel.description || hotel.hotel_description || "Experience comfort and luxury at this beautiful property.",
      longDescription: hotel.hotel_description || hotel.description_translations?.en || hotel.description,
      amenities: processFacilities(hotel.facilities),
      reviews: processReviews(hotel.reviews),
      provider: "booking",
      // Additional details
      currency: hotel.currency_code || "USD",
      checkInTime: hotel.checkin?.from || "15:00",
      checkOutTime: hotel.checkout?.until || "11:00",
      hotelClass: hotel.class || hotel.hotel_class,
      distanceFromCenter: hotel.distance_to_cc,
      coordinates: {
        latitude: hotel.latitude,
        longitude: hotel.longitude,
      },
      policies: {
        checkIn: hotel.checkin,
        checkOut: hotel.checkout,
        children: hotel.children_policy,
        pets: hotel.pets_policy,
      },
    }

    console.log("Processed hotel details with enhanced images:", processedHotel)

    return {
      success: true,
      hotel: processedHotel,
      dataSource: "Booking.com API + Enhanced Images",
    }
  } catch (error) {
    console.error("RapidAPI hotel details error:", error)
    throw error
  }
}

export async function getHotelRooms(hotelId, params = {}) {
  if (!RAPIDAPI_KEY) {
    throw new Error("RapidAPI key not configured")
  }

  try {
    const { adults = 2, children = 0, roomQty = 1 } = params

    const url = `https://${RAPIDAPI_HOST}/api/v1/hotels/getRooms`

    const queryParams = new URLSearchParams({
      hotel_id: hotelId,
      arrival_date: new Date().toISOString().split("T")[0],
      departure_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      adults: adults.toString(),
      children: children.toString(),
      room_qty: roomQty.toString(),
      languagecode: "en-us",
      currency_code: "USD",
    })

    console.log("Fetching hotel rooms:", `${url}?${queryParams}`)

    const response = await fetchWithTimeout(
      `${url}?${queryParams}`,
      {
        method: "GET",
        headers: rapidApiHeaders,
      },
      8000,
    )

    if (!response.ok) {
      throw new Error(`RapidAPI request failed: ${response.status}`)
    }

    const data = await response.json()
    console.log("Hotel rooms raw response:", data)

    const processRoomImages = async (photos, roomName = "room", hotelName = "") => {
      if (!photos || !Array.isArray(photos)) {
        // Use enhanced image service for room-specific images
        try {
          const roomImageData = await getHotelImages(`${hotelName} ${roomName}`, "", [])
          return roomImageData.allImages.slice(0, 3)
        } catch (error) {
          return [`https://source.unsplash.com/800x600/?hotel+room+${encodeURIComponent(roomName)}`]
        }
      }

      const processedImages = photos
        .map((photo) => {
          if (typeof photo === "string") return photo
          return photo.url_original || photo.url_max300 || photo.url
        })
        .filter(Boolean)

      return processedImages.length > 0
        ? processedImages
        : [`https://source.unsplash.com/800x600/?hotel+room+${encodeURIComponent(roomName)}`]
    }

    const roomsWithImages = await Promise.all(
      (data.data?.rooms || []).map(async (room, index) => {
        const roomName = room.room_name || room.name || `Room ${index + 1}`
        const hotelName = data.data?.hotel_name || "Hotel"

        return {
          id: room.room_id || `room_${index}`,
          name: roomName,
          description: room.room_description || room.description || "Comfortable room with modern amenities",
          price: room.price || room.min_price || 0,
          capacity: {
            adults: room.max_occupancy || room.max_persons || adults,
            children: room.max_children || 0,
          },
          images: await processRoomImages(room.photos, roomName, hotelName),
          amenities: room.room_facilities || room.facilities || [],
          bedType: room.bed_configurations || room.bed_type,
          roomSize: room.room_size,
          availability: room.block_ids ? room.block_ids.length > 0 : true,
        }
      }),
    )

    console.log("Processed rooms with enhanced images:", roomsWithImages)

    return {
      success: true,
      rooms: roomsWithImages,
      dataSource: "Booking.com API + Enhanced Images",
    }
  } catch (error) {
    console.error("RapidAPI hotel rooms error:", error)
    throw error
  }
}
