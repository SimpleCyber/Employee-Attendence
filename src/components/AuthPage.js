"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../firebase"
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react"

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [userType, setUserType] = useState("admin")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signup, login } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isLogin) {
        console.log("Attempting login...")
        const userCredential = await login(formData.email, formData.password)

        console.log("Login successful, checking user type...")
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          console.log("User type:", userData.userType)

          if (userData.userType === "admin") {
            navigate("/admindashboard")
          } else {
            navigate("/employeehome")
          }
        } else {
          console.log("User document not found, redirecting to home")
          navigate("/")
        }
      } else {
        console.log("Attempting signup...")

        if (userType === "employee") {
          // Check if employee email exists in employees collection
          console.log("Checking if employee email exists...")
          const employeesQuery = query(collection(db, "employees"), where("email", "==", formData.email))
          const employeeSnapshot = await getDocs(employeesQuery)

          if (employeeSnapshot.empty) {
            setError("Employee email not found. Please contact admin to add your email first.")
            setLoading(false)
            return
          }
        }

        const result = await signup(formData.email, formData.password, userType, formData.name)
        console.log("Signup successful")

        if (userType === "admin") {
          navigate("/admindashboard")
        } else {
          navigate("/employeehome")
        }
      }
    } catch (error) {
      console.error("Auth error:", error)

      if (error.code === "permission-denied") {
        setError("Firebase permission denied. Please check your security rules in Firebase Console.")
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email address.")
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.")
      } else if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.")
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.")
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.")
      } else {
        setError(`Error: ${error.message}`)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{isLogin ? "Sign In" : "Create Account"}</h2>
            <p className="text-gray-600">{isLogin ? "Welcome back!" : "Join our attendance system"}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">
              {error}
              {error.includes("permission denied") && (
                <div className="mt-2 text-sm">
                  <p>To fix this:</p>
                  <ol className="list-decimal pl-4 mt-1">
                    <li>Go to Firebase Console</li>
                    <li>Navigate to Firestore Database → Rules</li>
                    <li>Use the permissive rules from the setup guide</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="admin"
                      checked={userType === "admin"}
                      onChange={(e) => setUserType(e.target.value)}
                      className="mr-2"
                    />
                    Admin
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="employee"
                      checked={userType === "employee"}
                      onChange={(e) => setUserType(e.target.value)}
                      className="mr-2"
                    />
                    Employee
                  </label>
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium transition duration-200 disabled:opacity-50"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 hover:text-indigo-500 font-medium">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
