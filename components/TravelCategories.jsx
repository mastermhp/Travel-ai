"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"
import { Umbrella, Mountain, Building, Utensils, Tent, Ship } from "lucide-react"

export default function TravelCategories() {
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

    const items = containerRef.current.querySelectorAll(".category-card")
    items.forEach((item) => {
      observer.observe(item)
    })

    return () => {
      items.forEach((item) => {
        observer.unobserve(item)
      })
    }
  }, [])

  const categories = [
    {
      id: 1,
      name: "Beach Getaways",
      icon: <Umbrella className="h-8 w-8 text-black" />,
      count: "245+ destinations",
    },
    {
      id: 2,
      name: "Mountain Retreats",
      icon: <Mountain className="h-8 w-8 text-black" />,
      count: "183+ destinations",
    },
    {
      id: 3,
      name: "City Breaks",
      icon: <Building className="h-8 w-8 text-black" />,
      count: "320+ destinations",
    },
    {
      id: 4,
      name: "Food & Culinary",
      icon: <Utensils className="h-8 w-8 text-black" />,
      count: "157+ experiences",
    },
    {
      id: 5,
      name: "Adventure & Outdoors",
      icon: <Tent className="h-8 w-8 text-black" />,
      count: "215+ activities",
    },
    {
      id: 6,
      name: "Cruises",
      icon: <Ship className="h-8 w-8 text-black" />,
      count: "89+ routes",
    },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4" ref={containerRef}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the perfect travel experience based on your interests and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="category-card opacity-0 translate-y-10 transition-all duration-700 ease-out"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Link href={`/categories/${category.id}`}>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full card-hover">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-gray-500">{category.count}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
