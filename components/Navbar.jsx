"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, User, LogOut, Settings, CheckSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext" // Import the auth context

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth() // Use authentication context
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      await logout()
      setUserMenuOpen(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-black rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <span className={`font-bold text-xl ${scrolled ? "text-black" : "text-white"}`}>TravelBuddy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`font-medium ${scrolled ? "text-gray-800 hover:text-black" : "text-white hover:text-gray-200"} transition-colors`}
            >
              Home
            </Link>
            <Link
              href="/destinations"
              className={`font-medium ${scrolled ? "text-gray-800 hover:text-black" : "text-white hover:text-gray-200"} transition-colors`}
            >
              Destinations
            </Link>
            <Link
              href="/hotels"
              className={`font-medium ${scrolled ? "text-gray-800 hover:text-black" : "text-white hover:text-gray-200"} transition-colors`}
            >
              Hotels
            </Link>
            <Link
              href="/chat"
              className={`font-medium ${scrolled ? "text-gray-800 hover:text-black" : "text-white hover:text-gray-200"} transition-colors`}
            >
              AI Chat
            </Link>
            <Link
              href="/tasks"
              className={`font-medium ${scrolled ? "text-gray-800 hover:text-black" : "text-white hover:text-gray-200"} transition-colors flex items-center`}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Tasks
            </Link>

            {isAuthenticated() ? (
              // User is authenticated - show user menu
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center space-x-2 ${scrolled ? "text-gray-800 hover:text-black" : "text-white hover:text-gray-200"} transition-colors`}
                >
                  <div
                    className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ${scrolled ? "text-gray-700" : "text-gray-600"}`}
                  >
                    <User className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{user?.firstName || "Account"}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/tasks"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <div className="flex items-center">
                        <CheckSquare className="h-4 w-4 mr-2" />
                        My Tasks
                      </div>
                    </Link>
                    <Link
                      href="/bookings"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      My Bookings
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Profile Settings
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // User is not authenticated - show login/signup buttons
              <>
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-full ${scrolled ? "bg-white text-black border border-black hover:bg-gray-50" : "bg-white/20 text-white hover:bg-white/30"} transition-colors`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden text-gray-500 focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <X className={`h-6 w-6 ${scrolled ? "text-gray-800" : "text-white"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${scrolled ? "text-gray-800" : "text-white"}`} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 py-4 bg-white rounded-lg shadow-lg">
            <nav className="flex flex-col space-y-4 px-4">
              <Link
                href="/"
                className="font-medium text-gray-800 hover:text-black transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/destinations"
                className="font-medium text-gray-800 hover:text-black transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Destinations
              </Link>
              <Link
                href="/hotels"
                className="font-medium text-gray-800 hover:text-black transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Hotels
              </Link>
              <Link
                href="/chat"
                className="font-medium text-gray-800 hover:text-black transition-colors"
                onClick={() => setIsOpen(false)}
              >
                AI Chat
              </Link>
              <Link
                href="/tasks"
                className="font-medium text-gray-800 hover:text-black transition-colors flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Tasks
              </Link>

              {isAuthenticated() ? (
                // User is authenticated - show profile links and logout
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{user?.email}</p>
                    </div>
                  </div>

                  <Link
                    href="/tasks"
                    className="flex items-center w-full py-2 px-3 rounded-md font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    My Tasks
                  </Link>

                  <Link
                    href="/bookings"
                    className="flex items-center w-full py-2 px-3 rounded-md font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    My Bookings
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center w-full py-2 px-3 rounded-md font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Link>

                  <button
                    onClick={(e) => {
                      handleLogout(e)
                      setIsOpen(false)
                    }}
                    className="flex items-center w-full py-2 px-3 rounded-md font-medium text-red-600 hover:bg-gray-100 mt-2"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                // User is not authenticated - show login/signup buttons
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-full bg-white text-black border border-black hover:bg-gray-50 transition-colors text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
