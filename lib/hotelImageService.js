// Enhanced hotel image service that works without external APIs
export async function getHotelImages(hotelName, location = "", apiImages = []) {
  console.log(`Getting enhanced images for: ${hotelName} in ${location}`)

  // Clean and process hotel name for better image matching
  const cleanHotelName = hotelName.toLowerCase()
  const cleanLocation = location.toLowerCase()

  // Detect hotel brand/chain
  const hotelBrand = detectHotelBrand(cleanHotelName)

  // Create multiple high-quality image URLs using different strategies
  const imageUrls = generateHotelImageUrls(hotelName, location, hotelBrand)

  return {
    mainImage: imageUrls[0],
    allImages: imageUrls,
    source: "Enhanced Curated",
    imageDetails: {
      brand: hotelBrand,
      searchTerms: generateSearchTerms(hotelName, location, hotelBrand),
      totalImages: imageUrls.length,
    },
  }
}

// Detect hotel brand from name
function detectHotelBrand(hotelName) {
  const brands = {
    westin: ["westin"],
    marriott: ["marriott"],
    hilton: ["hilton"],
    hyatt: ["hyatt"],
    intercontinental: ["intercontinental"],
    radisson: ["radisson"],
    sheraton: ["sheraton"],
    "four-seasons": ["four seasons", "four-seasons"],
    ritz: ["ritz", "ritz-carlton"],
    mandarin: ["mandarin oriental"],
    peninsula: ["peninsula"],
    "st-regis": ["st regis", "st. regis"],
    "w-hotel": ["w hotel", " w "],
    doubletree: ["doubletree"],
    embassy: ["embassy suites"],
    holiday: ["holiday inn"],
    crowne: ["crowne plaza"],
    regent: ["regent"],
    shangri: ["shangri-la", "shangri la"],
  }

  for (const [brand, keywords] of Object.entries(brands)) {
    if (keywords.some((keyword) => hotelName.includes(keyword))) {
      return brand
    }
  }

  return "luxury" // Default fallback
}

// Generate search terms for better image matching
function generateSearchTerms(hotelName, location, brand) {
  const terms = []

  // Primary brand-based term
  if (brand !== "luxury") {
    terms.push(`${brand}+hotel+luxury`)
  }

  // Location-based terms
  if (location) {
    const cleanLocation = location
      .split(",")[0]
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "+")
    terms.push(`luxury+hotel+${cleanLocation}`)
    terms.push(`${brand}+hotel+${cleanLocation}`)
  }

  // Generic luxury terms
  terms.push("luxury+hotel+exterior")
  terms.push("luxury+hotel+lobby")
  terms.push("luxury+hotel+interior")

  return terms
}

// Generate multiple high-quality image URLs
function generateHotelImageUrls(hotelName, location, brand) {
  const baseUrl = "https://source.unsplash.com"
  const dimensions = ["800x600", "1200x800", "1000x700", "900x600"]
  const imageTypes = ["exterior", "lobby", "interior", "pool", "restaurant", "suite"]

  const urls = []

  // Brand-specific images
  if (brand !== "luxury") {
    imageTypes.forEach((type, index) => {
      const dim = dimensions[index % dimensions.length]
      const searchTerm = `${brand}+hotel+${type}+luxury`
      urls.push(`${baseUrl}/${dim}/?${searchTerm}&sig=${hashString(hotelName + type)}`)
    })
  }

  // Location-specific images
  if (location) {
    const cleanLocation = location
      .split(",")[0]
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "+")
    imageTypes.slice(0, 3).forEach((type, index) => {
      const dim = dimensions[index % dimensions.length]
      const searchTerm = `luxury+hotel+${cleanLocation}+${type}`
      urls.push(`${baseUrl}/${dim}/?${searchTerm}&sig=${hashString(hotelName + location + type)}`)
    })
  }

  // Generic luxury hotel images as fallbacks
  const fallbackTerms = [
    "luxury+hotel+exterior+modern",
    "luxury+hotel+lobby+elegant",
    "luxury+hotel+suite+premium",
    "luxury+hotel+pool+resort",
    "luxury+hotel+restaurant+fine+dining",
    "luxury+hotel+spa+wellness",
  ]

  fallbackTerms.forEach((term, index) => {
    const dim = dimensions[index % dimensions.length]
    urls.push(`${baseUrl}/${dim}/?${term}&sig=${hashString(hotelName + term)}`)
  })

  // Return unique URLs (remove duplicates and limit to 8)
  return [...new Set(urls)].slice(0, 8)
}

// Simple hash function for consistent image selection
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}
