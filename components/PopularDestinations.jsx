"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

export default function PopularDestinations() {
  const containerRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0")
            entry.target.classList.remove("opacity-0", "translate-y-10")
          }
        })
      },
      { threshold: 0.1 },
    )

    const items = containerRef.current.querySelectorAll(".destination-card")
    items.forEach((item) => {
      observer.observe(item)
    })

    return () => {
      items.forEach((item) => {
        observer.unobserve(item)
      })
    }
  }, [])

  const destinations = [
    {
      id: 1,
      name: "Bali, Indonesia",
      image: "/bali.jpg?height=600&width=800",
      description: "Tropical paradise with beautiful beaches and rich culture",
      rating: 4.8,
      price: "$1,200",
    },
    {
      id: 2,
      name: "Santorini, Greece",
      image: "/santorini.jpg?height=600&width=800",
      description: "Stunning white buildings and breathtaking sea views",
      rating: 4.9,
      price: "$1,800",
    },
    {
      id: 3,
      name: "Kyoto, Japan",
      image: "/kyoto.jpg?height=600&width=800",
      description: "Ancient temples and beautiful cherry blossoms",
      rating: 4.7,
      price: "$1,500",
    },
    {
      id: 4,
      name: "Paris, France",
      image: "/psg.jpg?height=600&width=800",
      description: "City of lights with iconic landmarks and cuisine",
      rating: 4.6,
      price: "$1,400",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4" ref={containerRef}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Destinations</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our most popular travel destinations loved by travelers around the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {destinations.map((destination, index) => (
            <div
              key={destination.id}
              className="destination-card opacity-0 translate-y-10 transition-all duration-700 ease-out"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Link href={`/destinations/${destination.id}`}>
                <div className="bg-white rounded-xl overflow-hidden shadow-lg h-full card-hover">
                  <div className="relative h-48">
                    <Image
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-medium text-black">
                      {destination.rating} ★
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{destination.name}</h3>
                    <p className="text-gray-600 mb-4">{destination.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-black font-bold">{destination.price}</span>
                      <span className="text-gray-500 text-sm">per person</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/destinations"
            className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            View All Destinations
          </Link>
        </div>
      </div>
    </section>
  )
}
