"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import { ArrowLeft, Calendar, CheckCircle, XCircle, MapPin, User, Clock } from "lucide-react"

function CalendarView() {
  const [employee, setEmployee] = useState(null)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { employeeId } = useParams()
  const { currentUser, userType } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth")
      return
    }

    if (userType !== "admin" && currentUser.uid !== employeeId) {
      navigate("/")
      return
    }

    fetchEmployeeData()
  }, [currentUser, employeeId, navigate, userType])

  const fetchEmployeeData = async () => {
    try {
      console.log("Fetching employee data for:", employeeId)

      // Get user document which contains attendance data
      const userDoc = await getDoc(doc(db, "users", employeeId))

      if (userDoc.exists()) {
        const userData = userDoc.data()
        console.log("User data found:", userData)

        setEmployee({
          id: employeeId,
          ...userData,
        })

        // Extract attendance history from user document
        const attendanceData = userData.attendance || {}
        console.log("Attendance data:", attendanceData)

        // Convert attendance object to array format
        const attendanceArray = Object.keys(attendanceData).map((date) => ({
          date,
          ...attendanceData[date],
        }))

        // Sort by date (newest first)
        attendanceArray.sort((a, b) => new Date(b.date) - new Date(a.date))

        console.log("Processed attendance array:", attendanceArray)
        setAttendanceHistory(attendanceArray)
      } else {
        console.log("User document not found")
        setError("Employee not found")
      }
    } catch (error) {
      console.error("Error fetching employee data:", error)
      setError("Failed to load employee data: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (userType === "admin") {
      navigate("/admindashboard")
    } else {
      navigate("/employeehome")
    }
  }

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Create attendance lookup by date
    const attendanceLookup = {}
    attendanceHistory.forEach((record) => {
      attendanceLookup[record.date] = record
    })

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split("T")[0]
      const attendance = attendanceLookup[dateString]
      const isToday = new Date().toISOString().split("T")[0] === dateString
      const isPastDate = date < new Date().setHours(0, 0, 0, 0)

      days.push(
        <div key={day} className={`h-24 border border-gray-200 p-2 ${isToday ? "bg-blue-50" : ""}`}>
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isToday ? "text-blue-600" : ""}`}>{day}</span>
            {attendance && attendance.presentornot ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Present
              </span>
            ) : (
              isPastDate && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Absent
                </span>
              )
            )}
          </div>

          {attendance && attendance.presentornot && (
            <div className="mt-1 text-xs text-gray-500">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{attendance.time}</span>
              </div>
              {attendance.location && attendance.location.latitude && (
                <div className="flex items-center mt-0.5 truncate">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {attendance.location.latitude.toFixed(4)}, {attendance.location.longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  const previousMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(newMonth.getMonth() - 1)
      return newMonth
    })
  }

  const nextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(newMonth.getMonth() + 1)
      return newMonth
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
          <button onClick={goBack} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const presentDays = attendanceHistory.filter((record) => record.presentornot).length
  const totalDays = 30
  const absentDays = totalDays - presentDays
  const attendanceRate = Math.round((presentDays / totalDays) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button onClick={goBack} className="text-gray-500 hover:text-gray-700 mr-4">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <Calendar className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Attendance Calendar</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Employee Info */}
        {employee && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center">
              <User className="h-12 w-12 text-indigo-600 bg-indigo-100 p-2 rounded-full" />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
                <p className="text-gray-600">{employee.email}</p>
                <p className="text-sm text-gray-500">
                  Employee since: {new Date(employee.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">30-Day Attendance Summary</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Days</p>
              <p className="text-2xl font-bold text-gray-900">{totalDays}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">Present Days</p>
              <p className="text-2xl font-bold text-green-700">{presentDays}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600">Absent Days</p>
              <p className="text-2xl font-bold text-red-700">{absentDays}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-700">{attendanceRate}%</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Calendar</h2>

            <div className="flex items-center space-x-4">
              <button onClick={previousMonth} className="p-1 rounded-full hover:bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="text-gray-900 font-medium">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>

              <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Attendance Records</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {attendanceHistory.length > 0 ? (
              attendanceHistory.slice(0, 10).map((record, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {record.presentornot ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {record.presentornot && (
                        <>
                          <div className="mt-1 text-sm text-gray-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Check-in time: {record.time}</span>
                          </div>

                          {record.location && record.location.latitude && (
                            <div className="mt-1 text-sm text-gray-500 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>
                                Location: {record.location.latitude.toFixed(6)}, {record.location.longitude.toFixed(6)}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {record.image && record.presentornot && (
                      <img
                        src={record.image || "/placeholder.svg"}
                        alt="Attendance"
                        className="h-16 w-16 object-cover rounded-md ml-4"
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No attendance records found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarView
