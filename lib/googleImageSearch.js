// Google Custom Search API for fetching real hotel images
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID

if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
  console.warn("Google Custom Search API not configured - using fallback images")
}

// Cache to store fetched images and avoid repeated API calls
const imageCache = new Map()

export async function searchHotelImages(hotelName, location = "") {
  // Create a cache key
  const cacheKey = `${hotelName}-${location}`.toLowerCase().replace(/\s+/g, "-")

  // Check cache first
  if (imageCache.has(cacheKey)) {
    console.log("Using cached images for:", hotelName)
    return imageCache.get(cacheKey)
  }

  // If no API keys, return fallback
  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
    const fallbackImages = generateFallbackImages(hotelName, location)
    imageCache.set(cacheKey, fallbackImages)
    return fallbackImages
  }

  try {
    // Create search query for hotel images
    const searchQuery = location
      ? `${hotelName} hotel ${location} exterior interior`
      : `${hotelName} hotel exterior interior`

    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=10&imgSize=large&imgType=photo&safe=active`

    console.log("Searching Google Images for:", searchQuery)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Google API request failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.items && data.items.length > 0) {
      // Extract image URLs from Google search results
      const images = data.items
        .map((item) => ({
          url: item.link,
          thumbnail: item.image?.thumbnailLink,
          title: item.title,
          source: item.displayLink,
        }))
        .filter((img) => img.url && isValidImageUrl(img.url))
        .slice(0, 6) // Take first 6 valid images

      console.log(`Found ${images.length} images for ${hotelName}`)

      // Cache the results
      imageCache.set(cacheKey, images)
      return images
    } else {
      console.log("No images found, using fallback")
      const fallbackImages = generateFallbackImages(hotelName, location)
      imageCache.set(cacheKey, fallbackImages)
      return fallbackImages
    }
  } catch (error) {
    console.error("Error fetching hotel images:", error)
    const fallbackImages = generateFallbackImages(hotelName, location)
    imageCache.set(cacheKey, fallbackImages)
    return fallbackImages
  }
}

// Validate image URL
function isValidImageUrl(url) {
  try {
    const urlObj = new URL(url)
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"]
    const hasValidExtension = validExtensions.some((ext) => urlObj.pathname.toLowerCase().includes(ext))

    // Check for common image hosting domains or valid extensions
    const validDomains = ["booking.com", "expedia.com", "hotels.com", "marriott.com", "hilton.com", "hyatt.com"]
    const hasValidDomain = validDomains.some((domain) => urlObj.hostname.includes(domain))

    return (
      (hasValidExtension || hasValidDomain) &&
      urlObj.protocol === "https:" &&
      !urlObj.pathname.includes("logo") &&
      !urlObj.pathname.includes("icon")
    )
  } catch {
    return false
  }
}

// Generate fallback images when Google search fails
function generateFallbackImages(hotelName, location) {
  const cleanHotelName = hotelName.replace(/[^\w\s]/g, "").replace(/\s+/g, "+")
  const cleanLocation = location
    ? location
        .split(",")[0]
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "+")
    : ""

  // Create multiple fallback images with different search terms
  const searchTerms = [
    `${cleanHotelName}+hotel`,
    `${cleanHotelName}+${cleanLocation}+hotel`,
    `${cleanHotelName}+luxury+hotel`,
    `${cleanHotelName}+hotel+exterior`,
    `${cleanHotelName}+hotel+lobby`,
    `${cleanHotelName}+hotel+room`,
  ].filter((term) => term.length > 10) // Filter out very short terms

  return searchTerms.slice(0, 6).map((term, index) => ({
    url: `https://source.unsplash.com/800x600/?${term}&sig=${hotelName.length + index}`,
    thumbnail: `https://source.unsplash.com/400x300/?${term}&sig=${hotelName.length + index}`,
    title: `${hotelName} - Image ${index + 1}`,
    source: "unsplash.com",
  }))
}

// Get the main hotel image (first image from search results)
export async function getMainHotelImage(hotelName, location = "") {
  const images = await searchHotelImages(hotelName, location)
  return images && images.length > 0 ? images[0].url : null
}

// Clear cache (useful for development)
export function clearImageCache() {
  imageCache.clear()
}
