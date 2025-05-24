"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { doc, getDoc, addDoc, collection, updateDoc, setDoc } from "firebase/firestore"
import { db } from "../firebase"
import {
  Camera,
  Calendar,
  CheckCircle,
  Clock,
  LogOut,
  User,
  Lock,
  MapPin,
  History,
  Upload,
  ImageIcon,
} from "lucide-react"

function EmployeeHome() {
  const [employeeName, setEmployeeName] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [password, setPassword] = useState("")
  const [capturedImage, setCapturedImage] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [cameraError, setCameraError] = useState("")
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const { currentUser, logout } = useAuth()

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const todayDate = new Date().toISOString().split("T")[0]

  useEffect(() => {
    fetchEmployeeData()
    checkTodayAttendance()
  }, [currentUser])

  const fetchEmployeeData = async () => {
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid))
        if (userDoc.exists()) {
          setEmployeeName(userDoc.data().name)
          setEmployeeId(currentUser.uid)
        }
      } catch (error) {
        console.error("Error fetching employee data:", error)
        setMessage("Error loading your profile. Please try again.")
      }
    }
  }

  const checkTodayAttendance = async () => {
    if (currentUser) {
      try {
        // Check if user document has today's attendance
        const userDoc = await getDoc(doc(db, "users", currentUser.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const attendanceData = userData.attendance || {}

          // Check if today's attendance exists
          if (attendanceData[todayDate] && attendanceData[todayDate].presentornot) {
            setAttendanceMarked(true)
          }
        }
      } catch (error) {
        console.error("Error checking attendance:", error)
      }
    }
  }

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
          resolve(locationData)
        },
        (error) => {
          console.error("Geolocation error:", error)
          reject(new Error(`Unable to get your location: ${error.message}`))
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      )
    })
  }

  const startCamera = async () => {
    try {
      // First try to get location
      try {
        const locationData = await getLocation()
        setLocation(locationData)
        console.log("Location obtained:", locationData)
      } catch (locationError) {
        console.error("Location error:", locationError)
        setMessage(`Location error: ${locationError.message}. Proceeding without location.`)
      }

      // Then try to access camera
      setCameraError("")
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      console.log("Requesting camera access with constraints:", constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((e) => {
            console.error("Error playing video:", e)
            setCameraError("Could not start video stream: " + e.message)
          })
        }
      }
      setShowCamera(true)
      setShowUpload(false)
    } catch (error) {
      console.error("Camera access error:", error)
      setCameraError(`Error accessing camera: ${error.message}. Please ensure you've granted camera permissions.`)
      setMessage("Camera error. Please check your browser permissions and try again.")
    }
  }

  const startUpload = async () => {
    try {
      // Get location for upload option too
      try {
        const locationData = await getLocation()
        setLocation(locationData)
        console.log("Location obtained:", locationData)
      } catch (locationError) {
        console.error("Location error:", locationError)
        setMessage(`Location error: ${locationError.message}. Proceeding without location.`)
      }

      setShowUpload(true)
      setShowCamera(false)
    } catch (error) {
      console.error("Upload setup error:", error)
      setMessage("Error setting up upload: " + error.message)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedImage(e.target.result)
          setCapturedImage(e.target.result) // Use the same state for consistency
        }
        reader.readAsDataURL(file)
      } else {
        setMessage("Please select a valid image file.")
      }
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      try {
        const canvas = canvasRef.current
        const video = videoRef.current
        const context = canvas.getContext("2d")

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = canvas.toDataURL("image/jpeg", 0.7)
        setCapturedImage(imageData)
        console.log("Photo captured successfully")

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
        setShowCamera(false)
      } catch (error) {
        console.error("Error capturing photo:", error)
        setMessage("Error capturing photo: " + error.message)
      }
    } else {
      setMessage("Camera not initialized properly")
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setUploadedImage(null)
    startCamera()
  }

  const retakeUpload = () => {
    setCapturedImage(null)
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    startUpload()
  }

  const submitAttendance = async () => {
    if (!capturedImage) {
      setMessage("Please capture a photo or upload an image before submitting.")
      return
    }

    if (!password) {
      setMessage("Please enter your password to confirm.")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      // Verify password by attempting to sign in
      const { signInWithEmailAndPassword } = await import("firebase/auth")
      const { auth } = await import("../firebase")

      await signInWithEmailAndPassword(auth, currentUser.email, password)

      const now = new Date()
      const attendanceRecord = {
        date: todayDate,
        time: now.toLocaleTimeString(),
        presentornot: true,
        location: location || { note: "Location not available" },
        image: capturedImage,
        timestamp: now.toISOString(),
      }

      // Update user document with attendance data
      const userRef = doc(db, "users", currentUser.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const currentAttendance = userData.attendance || {}

        // Add today's attendance
        currentAttendance[todayDate] = attendanceRecord

        // Keep only last 30 days of attendance
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]

        // Filter attendance to keep only last 30 days
        const filteredAttendance = {}
        Object.keys(currentAttendance).forEach((date) => {
          if (date >= thirtyDaysAgoStr) {
            filteredAttendance[date] = currentAttendance[date]
          }
        })

        // Update user document
        await updateDoc(userRef, {
          attendance: filteredAttendance,
          lastAttendanceUpdate: now.toISOString(),
        })

        console.log("Attendance saved successfully to user document")
      } else {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          email: currentUser.email,
          name: employeeName,
          userType: "employee",
          createdAt: new Date().toISOString(),
          attendance: {
            [todayDate]: attendanceRecord,
          },
          lastAttendanceUpdate: now.toISOString(),
        })
      }

      // Also save to attendance collection for admin dashboard
      await addDoc(collection(db, "attendance"), {
        employeeId: currentUser.uid,
        employeeName: employeeName,
        date: todayDate,
        time: now.toLocaleTimeString(),
        timestamp: now.toISOString(),
        photo: capturedImage,
        presentornot: true,
        location: location || { note: "Location not available" },
      })

      setAttendanceMarked(true)
      setCapturedImage(null)
      setUploadedImage(null)
      setPassword("")
      setMessage("Attendance marked successfully!")

      console.log("Attendance record saved:", attendanceRecord)
    } catch (error) {
      console.error("Error marking attendance:", error)
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setMessage("Invalid password. Please try again.")
      } else {
        setMessage("Error marking attendance: " + error.message)
      }
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/auth")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const navigateToCalendar = () => {
    navigate(`/calendar/${currentUser.uid}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <User className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Employee Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={navigateToCalendar} className="text-indigo-600 hover:text-indigo-800 flex items-center">
                <History className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Attendance History</span>
              </button>
              <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700 flex items-center">
                <LogOut className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hello, {employeeName}!</h1>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{today}</span>
          </div>
        </div>

        {/* Attendance Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Today's Attendance</h2>

          {message && (
            <div
              className={`mb-4 p-3 rounded-md ${
                message.includes("Error") || message.includes("Invalid")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {message}
            </div>
          )}

          {cameraError && (
            <div className="mb-4 p-3 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">
              <p className="font-medium">Camera Error:</p>
              <p>{cameraError}</p>
              <p className="mt-2 text-sm">Please ensure you've granted camera permissions in your browser settings.</p>
            </div>
          )}

          {attendanceMarked ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Attendance Marked!</h3>
              <p className="text-gray-600">Your attendance for today has been successfully recorded.</p>
              <button
                onClick={navigateToCalendar}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center mx-auto"
              >
                <History className="h-4 w-4 mr-2" />
                View Attendance History
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {!showCamera && !showUpload && !capturedImage && (
                <div className="text-center">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Mark Your Attendance</h3>
                  <p className="text-gray-600 mb-6">
                    Choose an option below to capture or upload your photo and mark attendance.
                    {location ? (
                      <span className="block mt-2 text-green-600 text-sm">
                        <MapPin className="inline-block h-4 w-4 mr-1" />
                        Location services are enabled
                      </span>
                    ) : (
                      <span className="block mt-2 text-yellow-600 text-sm">
                        <MapPin className="inline-block h-4 w-4 mr-1" />
                        Location services will be requested
                      </span>
                    )}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={startCamera}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Capture Photo
                    </button>

                    <button
                      onClick={startUpload}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Camera View */}
              {showCamera && (
                <div className="text-center">
                  <div className="relative inline-block">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md h-auto object-cover rounded-lg border-2 border-gray-300 mx-auto"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="mt-4 space-x-4">
                    <button
                      onClick={capturePhoto}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium"
                    >
                      Capture Photo
                    </button>
                    <button
                      onClick={() => {
                        if (streamRef.current) {
                          streamRef.current.getTracks().forEach((track) => track.stop())
                        }
                        setShowCamera(false)
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Upload View */}
              {showUpload && !capturedImage && (
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Photo</h3>
                    <p className="text-gray-600 mb-4">Select an image file from your device</p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium"
                    >
                      Choose File
                    </button>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => setShowUpload(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Captured/Uploaded Photo and Password */}
              {capturedImage && (
                <div className="space-y-4">
                  <div className="text-center">
                    <img
                      src={capturedImage || "/placeholder.svg"}
                      alt="Attendance"
                      className="w-full max-w-md h-auto object-cover rounded-lg border-2 border-gray-300 mx-auto"
                    />
                    <div className="mt-2 space-x-4">
                      {showCamera || (!showUpload && !uploadedImage) ? (
                        <button onClick={retakePhoto} className="text-indigo-600 hover:text-indigo-800 text-sm">
                          Retake Photo
                        </button>
                      ) : (
                        <button onClick={retakeUpload} className="text-indigo-600 hover:text-indigo-800 text-sm">
                          Choose Different Image
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-w-md mx-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Your Password to Confirm
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={submitAttendance}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50"
                    >
                      {loading ? "Submitting..." : "Submit Attendance"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeHome
