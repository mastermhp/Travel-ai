"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  CheckCircle,
  Circle,
  Plus,
  Search,
  Clock,
  Plane,
  Hotel,
  Camera,
  FileText,
  Trash2,
  Star,
  Users,
  DollarSign,
  RefreshCw,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import apiService from "@/services/api"

export default function TaskManagementPage() {
  const { user, isAuthenticated } = useAuth()
  const [tasks, setTasks] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "preparation",
    priority: "medium",
    dueDate: "",
    tripId: null,
  })

  const categories = [
    { id: "all", name: "All Tasks", icon: <FileText className="h-4 w-4" /> },
    { id: "preparation", name: "Preparation", icon: <FileText className="h-4 w-4" /> },
    { id: "booking", name: "Bookings", icon: <Hotel className="h-4 w-4" /> },
    { id: "transportation", name: "Transportation", icon: <Plane className="h-4 w-4" /> },
    { id: "activities", name: "Activities", icon: <Camera className="h-4 w-4" /> },
    { id: "documents", name: "Documents", icon: <FileText className="h-4 w-4" /> },
  ]

  const priorities = [
    { id: "high", name: "High", color: "text-red-600 bg-red-50" },
    { id: "medium", name: "Medium", color: "text-yellow-600 bg-yellow-50" },
    { id: "low", name: "Low", color: "text-green-600 bg-green-50" },
  ]

  useEffect(() => {
    if (isAuthenticated()) {
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const loadData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([loadTasks(), loadTrips()])
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      console.log("Loading tasks...")
      const response = await apiService.getTravelTasks()
      console.log("Tasks response:", response)

      if (response.success) {
        setTasks(response.tasks || [])
        console.log("Loaded tasks:", response.tasks)
      } else {
        console.error("Failed to load tasks:", response.message)
      }
    } catch (error) {
      console.error("Failed to load tasks:", error)
    }
  }

  const loadTrips = async () => {
    try {
      console.log("Loading trips...")
      const response = await apiService.getTravelTrips()
      console.log("Trips response:", response)

      if (response.success) {
        setTrips(response.trips || [])
        // Auto-select first trip if none selected
        if (!selectedTrip && response.trips && response.trips.length > 0) {
          setSelectedTrip(response.trips[0])
        }
        console.log("Loaded trips:", response.trips)
      } else {
        console.error("Failed to load trips:", response.message)
      }
    } catch (error) {
      console.error("Failed to load trips:", error)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      await loadData()
    } finally {
      setIsRefreshing(false)
    }
  }

  const toggleTaskStatus = async (taskId) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      const newStatus = task.status === "completed" ? "pending" : "completed"

      console.log("Updating task status:", taskId, newStatus)
      await apiService.updateTravelTask(taskId, { status: newStatus })

      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
    } catch (error) {
      console.error("Failed to update task:", error)
      // Update locally for demo
      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t)),
      )
    }
  }

  const deleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      console.log("Deleting task:", taskId)
      await apiService.deleteTravelTask(taskId)
      setTasks(tasks.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error("Failed to delete task:", error)
      // Delete locally for demo
      setTasks(tasks.filter((t) => t.id !== taskId))
    }
  }

  const addTask = async () => {
    if (!newTask.title.trim()) return

    try {
      const taskData = {
        ...newTask,
        tripId: selectedTrip?.id || newTask.tripId,
        status: "pending",
        aiGenerated: false,
        source: "Manual",
      }

      console.log("Creating new task:", taskData)
      const response = await apiService.createTravelTask(taskData)

      if (response.success) {
        setTasks([...tasks, response.task])
        console.log("Task created successfully:", response.task)
      }
    } catch (error) {
      console.error("Failed to create task:", error)
      // Add locally for demo
      const task = {
        id: Date.now(),
        ...newTask,
        tripId: selectedTrip?.id || newTask.tripId,
        status: "pending",
        createdAt: new Date().toISOString().split("T")[0],
        aiGenerated: false,
        source: "Manual",
      }
      setTasks([...tasks, task])
    }

    setNewTask({
      title: "",
      description: "",
      category: "preparation",
      priority: "medium",
      dueDate: "",
      tripId: null,
    })
    setShowAddTask(false)
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesTrip = !selectedTrip || task.tripId === selectedTrip.id
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesCategory = filterCategory === "all" || task.category === filterCategory
    const matchesSearch =
      !searchTerm ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesTrip && matchesStatus && matchesCategory && matchesSearch
  })

  const getTaskStats = () => {
    const tripTasks = selectedTrip ? tasks.filter((t) => t.tripId === selectedTrip.id) : tasks
    return {
      total: tripTasks.length,
      completed: tripTasks.filter((t) => t.status === "completed").length,
      pending: tripTasks.filter((t) => t.status === "pending").length,
      overdue: tripTasks.filter((t) => t.status === "pending" && new Date(t.dueDate) < new Date()).length,
    }
  }

  const stats = getTaskStats()

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your travel task management.</p>
          <Link href="/login" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Travel Task Management</h1>
            <p className="text-gray-600">Organize your travel plans with AI-generated tasks and custom reminders</p>
          </div>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Trip Selection */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <h2 className="text-xl font-bold mb-4 md:mb-0">Your Trips</h2>
            <Link
              href="/chat"
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Plan New Trip with AI
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No trips found. Start planning your first trip!</p>
              <Link
                href="/chat"
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Plan Trip with AI
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTrip?.id === trip.id ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h3 className="font-bold mb-2">{trip.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {trip.destination}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {trip.startDate} - {trip.endDate}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {trip.travelers} travelers
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />${trip.budget}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedTrip && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-black">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Add Task Button */}
                <button
                  onClick={() => setShowAddTask(true)}
                  className="bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <FileText className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No tasks found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterStatus !== "all" || filterCategory !== "all"
                      ? "Try adjusting your filters or search criteria"
                      : "Start planning your trip by chatting with our AI assistant"}
                  </p>
                  <Link
                    href="/chat"
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Plan with AI Assistant
                  </Link>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <button onClick={() => toggleTaskStatus(task.id)} className="mt-1">
                          {task.status === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3
                              className={`text-lg font-bold ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
                            >
                              {task.title}
                            </h3>

                            {/* Category Badge */}
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                              {categories.find((c) => c.id === task.category)?.name || task.category}
                            </span>

                            {/* Priority Badge */}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                priorities.find((p) => p.id === task.priority)?.color || "text-gray-600 bg-gray-50"
                              }`}
                            >
                              {task.priority}
                            </span>

                            {/* AI Generated Badge */}
                            {task.aiGenerated && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                <Star className="h-3 w-3 mr-1" />
                                AI
                              </span>
                            )}
                          </div>

                          <p className={`text-gray-600 mb-3 ${task.status === "completed" ? "line-through" : ""}`}>
                            {task.description}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {task.dueDate && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span
                                  className={
                                    new Date(task.dueDate) < new Date() && task.status !== "completed"
                                      ? "text-red-600"
                                      : ""
                                  }
                                >
                                  Due: {task.dueDate}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Created: {task.createdAt}
                            </div>

                            {task.source && (
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                {task.source}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Add New Task</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter task title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    rows={3}
                    placeholder="Enter task description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {categories
                        .filter((c) => c.id !== "all")
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {priorities.map((priority) => (
                        <option key={priority.id} value={priority.id}>
                          {priority.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={addTask}
                  className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
