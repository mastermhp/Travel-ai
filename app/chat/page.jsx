"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Bot, ImageIcon, X, RotateCw, Menu, CheckSquare } from "lucide-react"
import apiService from "@/services/api"
import ReactMarkdown from "react-markdown"
import Link from "next/link"

export default function ChatPage() {
  // Get session ID - generate a new one if not exists
  const getSessionId = () => {
    if (typeof window !== "undefined") {
      let sessionId = sessionStorage.getItem("chatSessionId")
      if (!sessionId) {
        sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
        sessionStorage.setItem("chatSessionId", sessionId)
      }
      return sessionId
    }
    return null
  }

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      content:
        "Hello! I'm your AI travel assistant. I can help with destinations, hotel recommendations, flight options, and local attractions. You can also upload images of places, and I'll try to identify and provide information about them. \n\n**✨ New Feature:** I'll automatically create travel tasks for you based on our conversation! Ask me about planning a trip and I'll help organize everything you need to do.",
      timestamp: new Date(),
      images: [],
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [newTasksCount, setNewTasksCount] = useState(0)
  const [showTaskNotification, setShowTaskNotification] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)
  const sessionId = getSessionId()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Focus input when clicking anywhere in chat area
  const handleChatAreaClick = () => {
    if (inputRef.current && !window.getSelection().toString()) {
      inputRef.current.focus()
    }
  }

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (sessionId) {
        try {
          const history = await apiService.getChatHistory(sessionId)
          if (history && history.messages && history.messages.length > 0) {
            // Convert timestamps back to Date objects
            const processedMessages = history.messages.map((msg) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
            setMessages(processedMessages)
          }
        } catch (error) {
          console.error("Failed to load chat history:", error)
        }
      }
    }

    loadChatHistory()
  }, [sessionId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove image
  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Start a new chat session
  const startNewChat = () => {
    if (window.confirm("Start a new chat? Your current conversation will be cleared.")) {
      // Generate a new session ID
      const newSessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
      sessionStorage.setItem("chatSessionId", newSessionId)

      // Reset messages to initial state
      setMessages([
        {
          id: 1,
          role: "bot",
          content:
            "Hello! I'm your AI travel assistant. I can help with destinations, hotel recommendations, flight options, and local attractions. You can also upload images of places, and I'll try to identify and provide information about them. \n\n**✨ New Feature:** I'll automatically create travel tasks for you based on our conversation! Ask me about planning a trip and I'll help organize everything you need to do.",
          timestamp: new Date(),
          images: [],
        },
      ])

      // Close mobile menu if open
      setIsMobileMenuOpen(false)
    }
  }

  // Auto-create trip and tasks from AI response
  const autoCreateTasksFromResponse = async (userMessage, aiResponse, aiTasks) => {
    try {
      // Only create tasks if AI generated some
      if (!aiTasks || aiTasks.length === 0) {
        console.log("No tasks to create")
        return
      }

      console.log("Auto-creating tasks from AI response:", aiTasks)

      // Try to extract destination from user message or AI response
      const destination = extractDestinationFromText(userMessage + " " + aiResponse)

      // Create or find trip
      let tripId = null
      if (destination) {
        try {
          const tripResponse = await apiService.createTravelTrip({
            name: `${destination} Trip`,
            destination: destination,
            startDate: getDefaultStartDate(),
            endDate: getDefaultEndDate(),
            status: "planning",
            budget: 2000,
            travelers: 2,
          })

          if (tripResponse.success) {
            tripId = tripResponse.trip.id
            console.log("Created trip with ID:", tripId)
          }
        } catch (tripError) {
          console.error("Failed to create trip:", tripError)
        }
      }

      // Create tasks
      let createdTasksCount = 0
      for (const task of aiTasks) {
        try {
          const taskData = {
            title: task.title,
            description: task.description,
            category: task.category || "preparation",
            priority: task.priority || "medium",
            dueDate: calculateDueDate(task.suggestedDueDate),
            tripId: tripId,
            aiGenerated: true,
            source: "AI Travel Assistant",
            estimatedCost: task.estimatedCost,
            tips: task.tips,
          }

          console.log("Creating task:", taskData)
          await apiService.createTravelTask(taskData)
          createdTasksCount++
        } catch (taskError) {
          console.error("Failed to create task:", taskError)
        }
      }

      // Show notification if tasks were created
      if (createdTasksCount > 0) {
        setNewTasksCount(createdTasksCount)
        setShowTaskNotification(true)

        console.log(`Successfully created ${createdTasksCount} tasks`)

        // Hide notification after 5 seconds
        setTimeout(() => {
          setShowTaskNotification(false)
        }, 5000)
      }
    } catch (error) {
      console.error("Error auto-creating tasks:", error)
    }
  }

  // Extract destination from text
  const extractDestinationFromText = (text) => {
    const lowerText = text.toLowerCase()

    // Common travel phrases that indicate destinations
    const patterns = [
      /(?:visit|go to|travel to|trip to|vacation in|holiday in)\s+([a-zA-Z\s,]+?)(?:\s|$|\.|\?|!)/gi,
      /(?:in|to)\s+([A-Z][a-zA-Z\s,]+?)(?:\s|$|\.|\?|!)/g,
    ]

    for (const pattern of patterns) {
      const matches = text.match(pattern)
      if (matches) {
        for (const match of matches) {
          const destination = match
            .replace(/^(visit|go to|travel to|trip to|vacation in|holiday in|in|to)\s+/i, "")
            .trim()
          if (destination.length > 2 && destination.length < 50) {
            return destination.split(/[.!?]/)[0].trim()
          }
        }
      }
    }

    // Fallback: look for common destination names
    const commonDestinations = [
      "New York",
      "Paris",
      "London",
      "Tokyo",
      "Bali",
      "Rome",
      "Barcelona",
      "Amsterdam",
      "Dubai",
      "Singapore",
      "Bangkok",
      "Sydney",
      "Los Angeles",
      "San Francisco",
      "Miami",
      "Las Vegas",
      "Hawaii",
      "Maldives",
      "Santorini",
      "Iceland",
    ]

    for (const dest of commonDestinations) {
      if (lowerText.includes(dest.toLowerCase())) {
        return dest
      }
    }

    return null
  }

  // Calculate due date from AI suggestion
  const calculateDueDate = (suggestedDueDate) => {
    if (!suggestedDueDate) return null

    if (suggestedDueDate.includes("+")) {
      // Relative date like "+30 days"
      const days = Number.parseInt(suggestedDueDate.replace(/[^0-9]/g, ""))
      const date = new Date()
      date.setDate(date.getDate() + days)
      return date.toISOString().split("T")[0]
    } else if (suggestedDueDate.match(/\d{4}-\d{2}-\d{2}/)) {
      // Absolute date
      return suggestedDueDate
    }

    return null
  }

  // Get default trip dates
  const getDefaultStartDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 2) // 2 months from now
    return date.toISOString().split("T")[0]
  }

  const getDefaultEndDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 2)
    date.setDate(date.getDate() + 7) // 7 days trip
    return date.toISOString().split("T")[0]
  }

  // Format message content with custom styles for specific content types
  const renderFormattedContent = (content, role) => {
    if (role === "bot") {
      return (
        <div className="markdown-content">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-3" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-4 mb-2" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-md font-semibold mt-3 mb-1" {...props} />,
              p: ({ node, ...props }) => <p className="my-2" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
              li: ({ node, ...props }) => <li className="my-1" {...props} />,
              a: ({ node, href, ...props }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  {...props}
                />
              ),
              strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
              em: ({ node, ...props }) => <em className="italic" {...props} />,
              code: ({ node, ...props }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />,
              pre: ({ node, ...props }) => (
                <pre className="bg-gray-100 p-3 rounded my-2 overflow-auto text-sm" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )
    }

    // For user messages
    return <p className="whitespace-pre-wrap mb-2 leading-relaxed">{content}</p>
  }

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!input.trim() && !imageFile) return

    // Prepare user message
    const userMessage = {
      id: messages.length + 1,
      role: "user",
      content: input || "📷 Image uploaded",
      timestamp: new Date(),
      images: imageFile ? [imagePreview] : [],
    }

    // Add to messages
    setMessages((prev) => [...prev, userMessage])

    // Store user input for task creation
    const userInput = input

    // Clear input
    setInput("")
    setIsLoading(true)

    try {
      // Create form data for image upload (if any)
      let formData = null
      let imageUploaded = false

      if (imageFile) {
        formData = new FormData()
        formData.append("image", imageFile)
        formData.append("sessionId", sessionId)
        formData.append("message", userInput || "")
        imageUploaded = true
      }

      // Send message to backend
      const response = imageUploaded
        ? await apiService.sendImageMessage(formData)
        : await apiService.travelAssistant(userInput, sessionId)

      console.log("API response:", response)

      // Process the response
      const responseContent = response.data || response.message || "I couldn't process that request. Please try again."
      const responseImages = response.images || []
      const aiTasks = response.tasks || []

      console.log("Response content:", responseContent)
      console.log("AI tasks:", aiTasks)

      // Ensure the response content doesn't contain JSON
      let cleanContent = responseContent
      if (cleanContent.includes('"title":') || cleanContent.includes('"description":')) {
        // If response still contains JSON, extract only the readable part
        const lines = cleanContent.split("\n")
        const cleanLines = []

        for (const line of lines) {
          if (
            line.includes('"title":') ||
            line.includes('"description":') ||
            line.includes("{") ||
            line.includes("}")
          ) {
            break
          }
          cleanLines.push(line)
        }

        cleanContent = cleanLines.join("\n").trim()

        // If we ended up with nothing, provide a fallback
        if (!cleanContent || cleanContent.length < 20) {
          cleanContent =
            "I've analyzed your travel request and created some helpful tasks for you! Check your task management page to see what I've organized for your trip."
        }
      }

      // Add bot response (clean, without JSON)
      const newBotMessage = {
        id: messages.length + 2,
        role: "bot",
        content: cleanContent,
        timestamp: new Date(),
        images: responseImages,
      }

      setMessages((prev) => [...prev, newBotMessage])

      // Auto-create tasks if AI provided any (this happens in background)
      if (aiTasks && aiTasks.length > 0) {
        await autoCreateTasksFromResponse(userInput, cleanContent, aiTasks)
      }

      // Clear image after successful send
      removeImage()
    } catch (error) {
      console.error("Chat error:", error)

      const errorMessage = {
        id: messages.length + 2,
        role: "bot",
        content: `Sorry, I encountered an error: ${error.message || "Unknown error"}. Please try again.`,
        timestamp: new Date(),
        images: [],
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Task Notification */}
      {showTaskNotification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5" />
            <div>
              <p className="font-medium">Tasks Created!</p>
              <p className="text-sm">
                I've added {newTasksCount} task{newTasksCount > 1 ? "s" : ""} to your task management
              </p>
            </div>
            <Link
              href="/tasks"
              className="ml-4 bg-white text-green-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
            >
              View Tasks
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-black text-white p-4 shadow-md z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-6 w-6 mr-3" />
            <div>
              <h1 className="text-xl font-bold">AI Travel Assistant</h1>
              <p className="text-gray-300 text-xs md:text-sm hidden sm:block">
                Your personal guide for travel planning with automatic task creation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/tasks"
              className="p-2 rounded-full hover:bg-gray-800 transition-colors flex items-center space-x-1"
              title="View your travel tasks"
            >
              <CheckSquare className="h-5 w-5" />
              <span className="hidden md:inline text-sm">Tasks</span>
            </Link>
            <button
              onClick={startNewChat}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              title="Start a new chat"
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 text-white p-3 shadow-inner">
          <div className="max-w-5xl mx-auto">
            <ul className="space-y-2">
              <li className="hover:bg-gray-800 p-2 rounded">
                <Link href="/tasks" className="w-full text-left flex items-center">
                  <CheckSquare className="h-4 w-4 mr-2" /> My Tasks
                </Link>
              </li>
              <li className="hover:bg-gray-800 p-2 rounded">
                <button onClick={startNewChat} className="w-full text-left flex items-center">
                  <RotateCw className="h-4 w-4 mr-2" /> New Chat
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Main content container with max width */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-5xl w-full mx-auto bg-white shadow-lg my-0 md:my-6 rounded-none md:rounded-xl">
        {/* Chat header */}
        <div className="bg-gray-50 p-4 border-b hidden md:block">
          <h2 className="text-lg font-semibold flex items-center">
            <Bot className="h-5 w-5 mr-2 text-black" />
            Chat with Travel Assistant
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ask about destinations, accommodations, or upload images of places. I'll automatically create tasks for your
            travel planning!
          </p>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6" onClick={handleChatAreaClick}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === "user"
                    ? "bg-black text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                <div className="flex items-center mb-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 ${
                      message.role === "user" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-black" />
                    )}
                  </div>
                  <span className={`text-xs ${message.role === "user" ? "text-gray-300" : "text-gray-500"}`}>
                    {message.role === "user" ? "You" : "Travel Assistant"} • {formatTime(message.timestamp)}
                  </span>
                </div>

                {/* Format the message content */}
                <div className={message.role === "bot" ? "prose prose-sm max-w-none" : ""}>
                  {renderFormattedContent(message.content, message.role)}
                </div>

                {/* Display images if any */}
                {message.images && message.images.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {message.images.map((img, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden shadow-sm">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Image ${idx + 1}`}
                          className="w-full h-auto max-h-96 object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-800 rounded-bl-none shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                    <Bot className="h-4 w-4 text-black" />
                  </div>
                  <span className="text-xs text-gray-500">Travel Assistant • {formatTime(new Date())}</span>
                </div>
                <div className="flex items-center space-x-2 py-2">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <p className="text-gray-500 text-sm">Planning your next adventure and creating tasks...</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t bg-gray-50 p-4">
          <div className="max-w-3xl mx-auto">
            {/* Image preview */}
            {imagePreview && (
              <div className="mb-3">
                <div className="h-20 w-20 rounded-md overflow-hidden relative shadow-md">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Upload preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-0 right-0 bg-black/70 p-1 rounded-bl-md hover:bg-black transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              {/* Hidden file input */}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

              {/* Message input */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about destinations, hotels, or say 'I want to visit [destination]' and I'll create tasks for you..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-black bg-white resize-none overflow-hidden shadow-sm"
                  disabled={isLoading}
                  rows={1}
                  style={{
                    minHeight: "3rem",
                    maxHeight: "8rem",
                    height: "auto",
                  }}
                  onInput={(e) => {
                    // Auto resize textarea based on content
                    e.target.style.height = "3rem"
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (input.trim() || imageFile) {
                        handleSendMessage(e)
                      }
                    }
                  }}
                />

                {/* Image upload button (inside text area) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`absolute right-2 bottom-2 p-2 rounded-full ${
                    isLoading ? "text-gray-400" : "text-gray-500 hover:text-black hover:bg-gray-100"
                  }`}
                  disabled={isLoading}
                  title="Upload an image"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Send button */}
              <button
                type="submit"
                className={`flex-shrink-0 bg-black text-white rounded-full p-3 shadow-sm ${
                  isLoading || (!input.trim() && !imageFile)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-800 active:translate-y-0.5 transition-all"
                }`}
                disabled={isLoading || (!input.trim() && !imageFile)}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>

            {/* Enhanced Suggestions */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm">
              <button
                onClick={() => setInput("I want to visit Bali for 7 days, help me plan everything")}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition-colors"
                disabled={isLoading}
              >
                Plan Bali trip with tasks
              </button>
              <button
                onClick={() => setInput("I need to visit New York for business, what should I prepare?")}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition-colors"
                disabled={isLoading}
              >
                Business trip to NYC
              </button>
              <button
                onClick={() => setInput("Plan a romantic getaway to Paris with my partner")}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition-colors"
                disabled={isLoading}
              >
                Romantic Paris trip
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                ✨ I'll automatically create travel tasks based on our conversation. Check your{" "}
                <Link href="/tasks" className="text-black hover:underline">
                  task management
                </Link>{" "}
                page!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for animations and styling */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        /* Markdown content styling */
        .markdown-content h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          margin-top: 0.5rem;
        }
        
        .markdown-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }
        
        .markdown-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }
        
        .markdown-content p {
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }
        
        .markdown-content ul, .markdown-content ol {
          margin-left: 0.5rem;
          margin-bottom: 0.75rem;
        }
        
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        
        .markdown-content a {
          color: #2563eb;
          text-decoration: none;
        }
        
        .markdown-content a:hover {
          text-decoration: underline;
        }
        
        .markdown-content strong {
          font-weight: 600;
        }
        
        .markdown-content strong:contains("Price:"), 
        .markdown-content strong:contains("$") {
          color: #047857;
        }
        
        /* Improve scrollbar appearance */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
          background: #ddd; 
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #bbb; 
        }
        
        /* Ensure the layout takes the full height but allows scrolling */
        html, body {
          height: 100%;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
