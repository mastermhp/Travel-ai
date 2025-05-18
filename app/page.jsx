import { Suspense } from "react"
import Link from "next/link"
import HeroSection from "@/components/HeroSection"
import PopularDestinations from "@/components/PopularDestinations"
import TravelCategories from "@/components/TravelCategories"
import Newsletter from "@/components/Newsletter"
import Footer from "@/components/Footer"
import Loading from "@/components/Loading"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<Loading />}>
        <HeroSection />
      </Suspense>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Discover Your Next <span className="text-black">Adventure</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Explore Destinations</h3>
            <p className="text-gray-600 mb-4">
              Discover beautiful places around the world with detailed guides and recommendations.
            </p>
            <Link href="/destinations" className="text-black font-medium hover:underline">
              Browse destinations →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Find Hotels</h3>
            <p className="text-gray-600 mb-4">
              Book the perfect stay from our curated selection of premium hotels and accommodations.
            </p>
            <Link href="/hotels" className="text-black font-medium hover:underline">
              Search hotels →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">AI Travel Assistant</h3>
            <p className="text-gray-600 mb-4">
              Get personalized travel recommendations and plan your trip with our AI assistant.
            </p>
            <Link href="/chat" className="text-black font-medium hover:underline">
              Chat now →
            </Link>
          </div>
        </div>
      </section>

      <Suspense fallback={<Loading />}>
        <PopularDestinations />
      </Suspense>

      <Suspense fallback={<Loading />}>
        <TravelCategories />
      </Suspense>

      <Newsletter />
      <Footer />
    </main>
  )
}
