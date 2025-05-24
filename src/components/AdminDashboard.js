"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import { Users, UserPlus, Calendar, CheckCircle, XCircle, LogOut, MapPin, Eye } from "lucide-react"

function AdminDashboard() {
  const [employees, setEmployees] = useState([])
  const [attendanceData, setAttendanceData] = useState({})
  const [adminName, setAdminName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const todayDate = new Date().toISOString().split("T")[0]

  useEffect(() => {
    fetchAdminData()
    fetchEmployees()
  }, [currentUser])

  const fetchAdminData = async () => {
    if (currentUser) {
      try {
        const adminDoc = await getDoc(doc(db, "users", currentUser.uid))
        if (adminDoc.exists()) {
          setAdminName(adminDoc.data().name)
        }
      } catch (error) {
        console.error("Error fetching admin data:", error)
        setError("Failed to load admin profile")
      }
    }
  }

  const fetchEmployees = async () => {
    try {
      // Get all users with userType "employee"
      const usersSnapshot = await getDocs(collection(db, "users"))
      const employeesList = []
      const todayAttendance = {}

      usersSnapshot.docs.forEach((doc) => {
        const userData = doc.data()
        if (userData.userType === "employee") {
          const employee = {
            id: doc.id,
            ...userData,
          }
          employeesList.push(employee)

          // Check today's attendance from user document
          const attendanceData = userData.attendance || {}
          if (attendanceData[todayDate] && attendanceData[todayDate].presentornot) {
            todayAttendance[doc.id] = attendanceData[todayDate]
          }
        }
      })

      console.log("Employees found:", employeesList)
      console.log("Today's attendance:", todayAttendance)

      setEmployees(employeesList)
      setAttendanceData(todayAttendance)
    } catch (error) {
      console.error("Error fetching employees:", error)
      setError("Failed to load employee data: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/auth")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const viewEmployeeCalendar = (employeeId) => {
    navigate(`/calendar/${employeeId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/addemployee"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Employee</span>
              </Link>
              <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700 flex items-center">
                <LogOut className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hello, {adminName}!</h1>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{today}</span>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-8">{error}</div>}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(attendanceData).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.length - Object.keys(attendanceData).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Attendance Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today's Attendance</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => {
                  const attendance = attendanceData[employee.id]
                  const isPresent = !!attendance

                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-indigo-600"
                          onClick={() => viewEmployeeCalendar(employee.id)}
                        >
                          {employee.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isPresent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isPresent ? "Present" : "Absent"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance ? attendance.time : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance && attendance.location ? (
                          attendance.location.latitude ? (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="truncate max-w-[150px]">
                                {attendance.location.latitude.toFixed(6)}, {attendance.location.longitude.toFixed(6)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No location data</span>
                          )
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => viewEmployeeCalendar(employee.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span>History</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {employees.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No employees found. Add some employees to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
