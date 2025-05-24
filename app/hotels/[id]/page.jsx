"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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
  Info
} from "lucide-react"
import apiService from "@/services/api"
import SafeImage from "@/components/SafeImage"

export default function HotelDetailPage() {
  const params = useParams()

  // Extract provider and hotelId from the URL
  // URL pattern could be:
  // - /hotels/provider/id (if API data)
  // - /hotels/ai/id (if AI generated)
  const { id } = params
  
  // Handle array or string
  const path = Array.isArray(id) ? id : [id];
  const provider = path[0] || 'booking';
  const hotelId = path[1] || path[0]; // use the first segment if only one is present

  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [dataSource, setDataSource] = useState("")
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [guests, setGuests] = useState(2)
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    const fetchHotelDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      if (!hotelId) {
        setError("Hotel ID is missing");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log(`Fetching hotel details for ${provider}/${hotelId}`);
        
        // Get hotel details
        const detailsResponse = await apiService.getHotelDetails(hotelId, provider);
        
        console.log("Hotel details response:", detailsResponse);
        
        if (detailsResponse && detailsResponse.success && detailsResponse.hotel) {
          // Set data source info
          setDataSource(detailsResponse.dataSource || "API");
          
          // Set hotel data
          setHotel(detailsResponse.hotel);
          
          // Get rooms if available
          if (provider === 'booking' || provider === 'ai') {
            try {
              const roomsResponse = await apiService.getHotelRooms(hotelId, provider, {
                adults: guests
              });
              
              if (roomsResponse && roomsResponse.rooms) {
                setRooms(roomsResponse.rooms);
              }
            } catch (roomsError) {
              console.error("Error fetching rooms:", roomsError);
              // Use rooms from hotel details if available
              if (detailsResponse.hotel.rooms) {
                setRooms(detailsResponse.hotel.rooms);
              }
            }
          } else if (detailsResponse.hotel.rooms) {
            // Use rooms from hotel details
            setRooms(detailsResponse.hotel.rooms);
          }
        } else {
          setError("Hotel details not found");
        }
      } catch (error) {
        console.error("Error fetching hotel details:", error);
        setError(error.message || "Failed to load hotel details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHotelDetails();
    
    // Set default check-in and check-out dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    setCheckInDate(today.toISOString().split('T')[0]);
    setCheckOutDate(tomorrow.toISOString().split('T')[0]);
    
  }, [hotelId, provider, guests]);
  
  // Calculate total price whenever check-in/out dates or selected room changes
  useEffect(() => {
    if (!checkInDate || !checkOutDate || !hotel) return;
    
    // Calculate number of nights
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const nights = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
    // Base price is hotel price
    let basePrice = hotel.price || 0;
    
    // If a room is selected, use that price
    if (selectedRoomId && rooms.length > 0) {
      const selectedRoom = rooms.find(room => {
        if (typeof room.id === 'number') {
          return room.id === parseInt(selectedRoomId);
        }
        return room.id === selectedRoomId;
      });
      
      if (selectedRoom) {
        basePrice = selectedRoom.price || basePrice;
      }
    }
    
    // Calculate total with fees
    const roomTotal = basePrice * nights;
    const cleaningFee = Math.round(basePrice * 0.1); // 10% of base price
    const serviceFee = Math.round(basePrice * 0.05); // 5% of base price
    
    setTotalPrice(roomTotal + cleaningFee + serviceFee);
    
  }, [checkInDate, checkOutDate, hotel, selectedRoomId, rooms]);

  const handleBooking = (e) => {
    e.preventDefault()

    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates.");
      return;
    }
    
    if (!selectedRoomId && rooms.length > 0) {
      alert("Please select a room.");
      return;
    }
    
    // Calculate nights
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const nights = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
    // Get selected room if any
    const selectedRoom = selectedRoomId 
      ? rooms.find(room => room.id === selectedRoomId)
      : null;
    
    // Booking summary
    const bookingSummary = `
      Hotel: ${hotel.name}
      Room: ${selectedRoom ? selectedRoom.name : 'Standard Room'}
      Check-in: ${checkInDate}
      Check-out: ${checkOutDate}
      Nights: ${nights}
      Guests: ${guests}
      Total Price: $${totalPrice}
    `;
    
    alert(`Booking Confirmed!\n\n${bookingSummary}\n\nThank you for booking with us!`);
    
    // In a real app, you'd call an API to create a booking
    // router.push(`/bookings/confirmation?hotelId=${hotelId}&checkIn=${checkInDate}&checkOut=${checkOutDate}`);
  };
  
  const selectRoom = (roomId) => {
    setSelectedRoomId(roomId === selectedRoomId ? null : roomId);
  };

  const getAmenityIcon = (amenity) => {
    const amenityLower = typeof amenity === 'string' ? amenity.toLowerCase() : '';
    
    if (amenityLower.includes('wifi')) return <Wifi className="h-5 w-5" />
    if (amenityLower.includes('breakfast')) return <Coffee className="h-5 w-5" />
    if (amenityLower.includes('tv')) return <Tv className="h-5 w-5" />
    if (amenityLower.includes('restaurant')) return <Utensils className="h-5 w-5" />
    if (amenityLower.includes('parking')) return <Parking className="h-5 w-5" />
    if (amenityLower.includes('air') || amenityLower.includes('ac')) return <Snowflake className="h-5 w-5" />
    if (amenityLower.includes('pool')) return <Pool className="h-5 w-5" />
    
    return <Check className="h-5 w-5" />
  }
  
  // Helper functions to get image URLs safely
  const getHotelImageUrl = (images, index) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return null;
    }
    
    const image = images[index];
    if (!image) return null;
    
    if (typeof image === 'string') {
      return image;
    } else if (typeof image === 'object' && image.url) {
      return image.url;
    }
    
    return null;
  }
  
  const getLocationBasedImageUrl = (location) => {
    const locationTerm = location ? 
      encodeURIComponent(location.split(',')[0]) : 
      'hotel';
    
    return `https://source.unsplash.com/random/800x600/?hotel+${locationTerm}`;
  }
  
  const getRoomImageUrl = (room) => {
    if (!room) return null;
    
    if (room.image) {
      return room.image;
    }
    
    if (room.images && room.images.length > 0) {
      if (typeof room.images[0] === 'string') {
        return room.images[0];
      } else if (typeof room.images[0] === 'object' && room.images[0].url) {
        return room.images[0].url;
      }
    }
    
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hotel Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The hotel you're looking for doesn't exist or has been removed."}</p>
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

        {/* Data source info */}
        {dataSource && dataSource.includes("AI") && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
            <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              This hotel information is enhanced with AI to provide you with the best experience.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {/* Hotel Images Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="md:col-span-2">
              <div className="relative h-80 md:h-96 rounded-lg overflow-hidden">
                <SafeImage
                  src={getHotelImageUrl(hotel.images, selectedImage)}
                  alt={hotel.name}
                  fill
                  className="object-cover transition-all duration-500"
                  fallbackSrc={getLocationBasedImageUrl(hotel.location || hotel.address || hotel.name)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              {Array.isArray(hotel.images) && hotel.images.slice(0, 3).map((image, index) => {
                const imageUrl = typeof image === 'object' ? image.url : typeof image === 'string' ? image : null;
                return (
                  <div
                    key={index}
                    className={`relative h-24 md:h-28 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                      selectedImage === index ? "ring-2 ring-black" : "opacity-80 hover:opacity-100"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <SafeImage
                      src={imageUrl}
                      alt={`${hotel.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      fallbackSrc={getLocationBasedImageUrl(hotel.location || hotel.address || hotel.name)}
                    />
                  </div>
                );
              })}
              
              {Array.isArray(hotel.images) && hotel.images.length > 3 && (
                <div
                  className="relative h-24 md:h-28 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedImage(3)}
                >
                  <SafeImage
                    src={
                      typeof hotel.images[3] === 'object'
                        ? hotel.images[3].url
                        : typeof hotel.images[3] === 'string'
                          ? hotel.images[3]
                          : null
                    }
                    alt={`${hotel.name} - Image 4`}
                    fill
                    className="object-cover group-hover:opacity-75 transition-opacity"
                    fallbackSrc={getLocationBasedImageUrl(hotel.location || hotel.address || hotel.name)}
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
                  <span>{hotel.address || hotel.location || "Location information unavailable"}</span>
                </div>
              </div>
              <div className="flex items-center bg-black text-white px-3 py-2 rounded-lg">
                <Star className="h-5 w-5 mr-1 fill-current" />
                <span className="font-bold">{hotel.rating}</span>
                <span className="ml-1 text-sm">/ 5</span>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{hotel.description || "Experience a comfortable stay at this property."}</p>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Array.isArray(hotel.amenities) ? hotel.amenities : []).map((amenity, idx) => (
                  <div key={`${amenity}-${idx}`} className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="capitalize">{typeof amenity === 'string' ? amenity.replace("-", " ") : ''}</span>
                  </div>
                ))}
              </div>
            </div>

            {hotel.longDescription && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">About This Property</h2>
                <p className="text-gray-700 whitespace-pre-line">{hotel.longDescription}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
                {rooms && rooms.length > 0 ? (
                  <div className="space-y-6">
                    {rooms.map((room, idx) => (
                      <div
                        key={room.id || idx}
                        className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                          selectedRoomId === room.id 
                            ? "border-black bg-gray-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => selectRoom(room.id)}
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className="relative h-48 md:w-1/3 mb-4 md:mb-0 md:mr-4 rounded-lg overflow-hidden">
                            <SafeImage 
                              src={getRoomImageUrl(room)} 
                              alt={room.name} 
                              fill 
                              className="object-cover" 
                              fallbackSrc={`https://source.unsplash.com/random/800x600/?hotel+room+${encodeURIComponent(room.name?.split(' ')[0] || 'luxury')}`}
                            />
                          </div>
                          <div className="md:w-2/3">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-bold">{room.name}</h3>
                              <div className="text-xl font-bold text-black">
                                ${typeof room.price === 'number' ? room.price.toFixed(0) : '0'}
                                <span className="text-sm text-gray-500 font-normal"> / night</span>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4">{room.description}</p>
                            <div className="flex items-center text-gray-600 mb-4">
                              <Users className="h-4 w-4 mr-1" />
                              <span className="text-sm">
                                Up to {
                                  room.capacity && typeof room.capacity === 'object'
                                    ? room.capacity.adults || 2
                                    : typeof room.capacity === 'number'
                                      ? room.capacity
                                      : 2
                                } guests
                              </span>
                            </div>
                            <button 
                              className={`${
                                selectedRoomId === room.id
                                  ? "bg-black text-white" 
                                  : "bg-white border border-black text-black hover:bg-gray-100"
                              } px-4 py-2 rounded-lg transition-colors`}
                            >
                              {selectedRoomId === room.id ? "Selected" : "Select Room"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">No rooms available for this property currently.</p>
                    <p className="text-gray-500">Please check back later or contact the hotel directly for availability.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Guest Reviews</h2>
                {hotel.reviews && hotel.reviews.length > 0 ? (
                  <>
                    <div className="space-y-6">
                      {hotel.reviews.map((review, idx) => (
                        <div key={review.id || idx} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold">{review.userInfo?.name || review.user || "Anonymous"}</div>
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
                          <p className="text-gray-700">{review.comment || review.text}</p>
                        </div>
                      ))}
                    </div>
                    {hotel.reviews.length > 3 && (
                      <div className="mt-6 text-center">
                        <button className="text-black hover:underline font-medium">View All Reviews</button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews available for this property yet.</p>
                  </div>
                )}
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
                    {/* Calculate number of nights */}
                    {checkInDate && checkOutDate && (
                      <>
                        {(() => {
                          const startDate = new Date(checkInDate);
                          const endDate = new Date(checkOutDate);
                          const nights = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
                          
                          const basePrice = selectedRoomId && rooms.length > 0
                            ? (rooms.find(room => room.id === selectedRoomId)?.price || hotel.price)
                            : hotel.price;
                            
                          const roomTotal = basePrice * nights;
                          const cleaningFee = Math.round(basePrice * 0.1);
                          const serviceFee = Math.round(basePrice * 0.05);
                            
                          return (
                            <>
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-600">${basePrice} x {nights} night{nights > 1 ? 's' : ''}</span>
                                <span>${roomTotal}</span>
                              </div>
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Cleaning fee</span>
                                <span>${cleaningFee}</span>
                              </div>
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Service fee</span>
                                <span>${serviceFee}</span>
                              </div>
                            </>
                          );
                        })()}
                      </>
                    )}
                    
                    <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
                      <span>Total</span>
                      <span>${totalPrice}</span>
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