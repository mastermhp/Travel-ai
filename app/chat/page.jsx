"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Bot, Loader2 } from "lucide-react"

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      content: "Hello! I'm your AI travel assistant. Where would you like to go on your next adventure?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // BACKEND_INTEGRATION: Replace with actual AI chat API call
      // Example:
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: input })
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // BACKEND_INTEGRATION: Use the response from your AI service
      // const botResponse = data.response;

      // For now, generate a placeholder response
      let botResponse = ""
      const userInput = input.toLowerCase()

      if (userInput.includes("bali") || userInput.includes("indonesia")) {
        botResponse =
          "Bali is a fantastic choice! Known for its beautiful beaches, vibrant culture, and stunning temples. The best time to visit is during the dry season (April to October). Would you like recommendations for hotels, activities, or specific areas to stay in Bali?"
      } else if (userInput.includes("japan") || userInput.includes("tokyo") || userInput.includes("kyoto")) {
        botResponse =
          "Japan is an amazing destination! From the bustling streets of Tokyo to the historic temples of Kyoto, there's so much to explore. Cherry blossom season (late March to early April) is particularly beautiful. Would you like to know more about specific cities, transportation, or must-visit attractions?"
      } else if (userInput.includes("paris") || userInput.includes("france")) {
        botResponse =
          "Paris, the City of Light! A perfect destination for art lovers, foodies, and romantics. The Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral are must-visit landmarks. Would you like recommendations for accommodations, restaurants, or day trips from Paris?"
      } else {
        botResponse =
          "That sounds like an interesting destination! I can help you plan your trip with recommendations for accommodations, attractions, local cuisine, and transportation options. Could you tell me more about what you're looking for in this trip?"
      }

      // Add bot response
      const newBotMessage = {
        id: messages.length + 2,
        role: "bot",
        content: botResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, newBotMessage])
    } catch (error) {
      console.error("Error getting chat response:", error)
      // Handle error - maybe add an error message to the chat
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
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-black text-white p-4">
            <h1 className="text-xl font-bold">AI Travel Assistant</h1>
            <p className="text-gray-300 text-sm">Ask me anything about travel destinations, hotels, or trip planning</p>
          </div>

          <div className="h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-black text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
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
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-800 rounded-bl-none">
                    <div className="flex items-center mb-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
                        <Bot className="h-4 w-4 text-black" />
                      </div>
                      <span className="text-xs text-gray-500">Travel Assistant • {formatTime(new Date())}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 text-black animate-spin" />
                      <p className="text-gray-500">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about destinations, hotels, or travel tips..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`bg-black text-white rounded-lg p-2 ${
                    isLoading || !input.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
                  }`}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                Try asking: "What are the best beaches in Bali?" or "Recommend hotels in Paris"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
