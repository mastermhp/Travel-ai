"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  MapPin,
  Star,
  Calendar,
  Users,
  Wifi,
  Coffee,
  Tv,
  Utensils,
  ParkingMeterIcon as Parking,
  Snowflake,
  PocketIcon as Pool,
  Check,
  ChevronLeft,
} from "lucide-react"

export default function HotelDetailPage() {
  const { id } = useParams()
  const [hotel, setHotel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [guests, setGuests] = useState(2)

  useEffect(() => {
    // BACKEND_INTEGRATION: Replace with actual hotel detail API call
    // Example:
    // const fetchHotelDetails = async () => {
    //   setIsLoading(true);
    //   try {
    //     const response = await fetch(`/api/hotels/${id}`);
    //     const data = await response.json();
    //     if (!response.ok) throw new Error(data.message);
    //     setHotel(data);
    //   } catch (error) {
    //     console.error('Error fetching hotel details:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchHotelDetails();

    // Simulate API call with mock data
    setIsLoading(true)
    setTimeout(() => {
      // This is mock data - replace with your API call
      const mockHotel = {
        id: Number.parseInt(id),
        name: "Grand Luxury Resort & Spa",
        location: "Bali, Indonesia",
        price: 250,
        rating: 4.8,
        description:
          "Nestled on the pristine shores of Bali, our luxury resort offers an unforgettable escape. Surrounded by lush tropical gardens and overlooking the crystal-clear waters of the Indian Ocean, this paradise retreat combines traditional Balinese charm with modern luxury.",
        longDescription:
          "Experience the ultimate in relaxation and rejuvenation at our award-winning spa, featuring traditional Balinese treatments and modern wellness therapies. Savor exquisite cuisine at our multiple restaurants, offering everything from authentic local dishes to international gourmet fare. Our spacious rooms and villas are designed with your comfort in mind, featuring private balconies or terraces with stunning views. Dive into our infinity pools, participate in daily yoga classes, or explore the island with our curated excursions. Whether you're seeking romance, adventure, or tranquility, our dedicated staff is committed to making your stay unforgettable.",
        amenities: [
          "wifi",
          "pool",
          "breakfast",
          "ac",
          "restaurant",
          "parking",
          "spa",
          "gym",
          "beach access",
          "room service",
          "concierge",
          "airport shuttle",
        ],
        images: [
          "/placeholder.svg?height=600&width=800",
          "/placeholder.svg?height=600&width=800",
          "/placeholder.svg?height=600&width=800",
          "/placeholder.svg?height=600&width=800",
        ],
        rooms: [
          {
            id: 1,
            name: "Deluxe Garden View",
            price: 250,
            description: "Spacious room with garden view, king-size bed, and modern amenities.",
            capacity: 2,
            image: "/placeholder.svg?height=300&width=500",
          },
          {
            id: 2,
            name: "Premium Ocean View",
            price: 350,
            description: "Luxurious room with stunning ocean views, king-size bed, and private balcony.",
            capacity: 2,
            image: "/placeholder.svg?height=300&width=500",
          },
          {
            id: 3,
            name: "Family Suite",
            price: 450,
            description: "Spacious suite with separate living area, two bedrooms, and garden view.",
            capacity: 4,
            image: "/placeholder.svg?height=300&width=500",
          },
          {
            id: 4,
            name: "Luxury Villa with Private Pool",
            price: 650,
            description: "Exclusive villa with private pool, ocean view, and personalized service.",
            capacity: 2,
            image: "/placeholder.svg?height=300&width=500",
          },
        ],
        reviews: [
          {
            id: 1,
            user: "John D.",
            rating: 5,
            date: "October 2023",
            comment: "Absolutely amazing stay! The staff was incredibly attentive and the facilities were top-notch.",
          },
          {
            id: 2,
            user: "Sarah M.",
            rating: 4,
            date: "September 2023",
            comment:
              "Beautiful property with excellent service. The only minor issue was the Wi-Fi connection in some areas.",
          },
          {
            id: 3,
            user: "Robert K.",
            rating: 5,
            date: "August 2023",
            comment:
              "One of the best resorts I've ever stayed at. The private beach access and infinity pool were highlights of our trip.",
          },
        ],
      }

      setHotel(mockHotel)
      setIsLoading(false)
    }, 1000)
  }, [id])

  const handleBooking = (e) => {
    e.preventDefault()

    // BACKEND_INTEGRATION: Replace with actual booking API call
    // Example:
    // const createBooking = async () => {
    //   try {
    //     const response = await fetch('/api/bookings', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         hotelId: hotel.id,
    //         roomId: selectedRoom.id,
    //         checkInDate,
    //         checkOutDate,
    //         guests,
    //         totalPrice: calculateTotalPrice()
    //       })
    //     });
    //     const data = await response.json();
    //     if (!response.ok) throw new Error(data.message);
    //     router.push(`/bookings/${data.bookingId}/confirmation`);
    //   } catch (error) {
    //     console.error('Booking failed:', error);
    //   }
    // };
    // createBooking();

    alert(
      `Booking request submitted for ${checkInDate} to ${checkOutDate} with ${guests} guests. Connect to your backend to complete this functionality.`,
    )
  }

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="h-5 w-5" />
      case "breakfast":
        return <Coffee className="h-5 w-5" />
      case "tv":
        return <Tv className="h-5 w-5" />
      case "restaurant":
        return <Utensils className="h-5 w-5" />
      case "parking":
        return <Parking className="h-5 w-5" />
      case "ac":
        return <Snowflake className="h-5 w-5" />
      case "pool":
        return <Pool className="h-5 w-5" />
      default:
        return <Check className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hotel Not Found</h2>
          <p className="text-gray-600 mb-4">The hotel you're looking for doesn't exist or has been removed.</p>
          <Link href="/hotels" className="text-black hover:underline">
            Browse all hotels
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <Link href="/hotels" className="inline-flex items-center text-black hover:underline mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to all hotels
        </Link>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {/* Hotel Images Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="md:col-span-2">
              <div className="relative h-80 md:h-96 rounded-lg overflow-hidden">
                <Image
                  src={hotel.images[selectedImage] || "/placeholder.svg"}
                  alt={hotel.name}
                  fill
                  className="object-cover transition-all duration-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              {hotel.images.slice(0, 3).map((image, index) => (
                <div
                  key={index}
                  className={`relative h-24 md:h-28 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedImage === index ? "ring-2 ring-black" : "opacity-80 hover:opacity-100"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${hotel.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {hotel.images.length > 3 && (
                <div
                  className="relative h-24 md:h-28 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedImage(3)}
                >
                  <Image
                    src={hotel.images[3] || "/placeholder.svg"}
                    alt={`${hotel.name} - Image 4`}
                    fill
                    className="object-cover group-hover:opacity-75 transition-opacity"
                  />
                  {hotel.images.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-medium">
                      +{hotel.images.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hotel Info */}
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 mr-1 text-black" />
                  <span>{hotel.location}</span>
                </div>
              </div>
              <div className="flex items-center bg-black text-white px-3 py-2 rounded-lg">
                <Star className="h-5 w-5 mr-1 fill-current" />
                <span className="font-bold">{hotel.rating}</span>
                <span className="ml-1 text-sm">/ 5</span>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{hotel.description}</p>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hotel.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="capitalize">{amenity.replace("-", " ")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">About This Property</h2>
              <p className="text-gray-700 whitespace-pre-line">{hotel.longDescription}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
                <div className="space-y-6">
                  {hotel.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="relative h-48 md:w-1/3 mb-4 md:mb-0 md:mr-4 rounded-lg overflow-hidden">
                          <Image src={room.image || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
                        </div>
                        <div className="md:w-2/3">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold">{room.name}</h3>
                            <div className="text-xl font-bold text-black">
                              ${room.price}
                              <span className="text-sm text-gray-500 font-normal"> / night</span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4">{room.description}</p>
                          <div className="flex items-center text-gray-600 mb-4">
                            <Users className="h-4 w-4 mr-1" />
                            <span className="text-sm">Up to {room.capacity} guests</span>
                          </div>
                          <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors">
                            Select Room
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Guest Reviews</h2>
                <div className="space-y-6">
                  {hotel.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold">{review.user}</div>
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <button className="text-black hover:underline font-medium">View All Reviews</button>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Book Your Stay</h2>
                <form onSubmit={handleBooking}>
                  <div className="mb-4">
                    <label htmlFor="check-in" className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        id="check-in"
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="check-out" className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        id="check-out"
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                      Guests
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 text-gray-400" size={18} />
                      <select
                        id="guests"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 appearance-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Guest" : "Guests"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">$250 x 3 nights</span>
                      <span>$750</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Cleaning fee</span>
                      <span>$50</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Service fee</span>
                      <span>$30</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
                      <span>Total</span>
                      <span>$830</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Reserve Now
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
