"use client"

import { useState } from "react"
import { Send } from "lucide-react"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      // BACKEND_INTEGRATION: Replace with actual newsletter subscription API call
      // Example:
      // const subscribeToNewsletter = async () => {
      //   try {
      //     const response = await fetch('/api/newsletter/subscribe', {
      //       method: 'POST',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify({ email })
      //     });
      //     const data = await response.json();
      //     if (!response.ok) throw new Error(data.message);
      //     setIsSubmitted(true);
      //     setEmail('');
      //   } catch (error) {
      //     console.error('Newsletter subscription failed:', error);
      //   }
      // };
      // subscribeToNewsletter();

      console.log("Submitted email:", email)
      setIsSubmitted(true)
      setEmail("")

      // Reset the success message after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 3000)
    }
  }

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get Travel Inspiration</h2>
          <p className="text-gray-300 mb-8">
            Subscribe to our newsletter and receive exclusive offers, travel tips, and destination guides.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-white text-black hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
            >
              <Send size={18} className="mr-2" />
              Subscribe
            </button>
          </form>

          {isSubmitted && (
            <div className="mt-4 text-white bg-gray-800 rounded-lg py-2 px-4 inline-block animate-fade-in">
              Thanks for subscribing!
            </div>
          )}

          <p className="text-gray-400 text-sm mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  )
}
