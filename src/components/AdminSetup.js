"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import { AlertCircle, CheckCircle } from "lucide-react"

function AdminSetup() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function setupAdminPermissions() {
      if (!currentUser) {
        navigate("/auth")
        return
      }

      try {
        setLoading(true)

        // First, try to read the user document
        console.log("Checking user document for:", currentUser.uid)
        const userDoc = await getDoc(doc(db, "users", currentUser.uid))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          console.log("User data:", userData)

          if (userData.userType === "admin") {
            setSuccess(true)
            setTimeout(() => {
              navigate("/admindashboard")
            }, 2000)
            return
          }
        }

        // If user doesn't exist or isn't admin, create/update the document
        console.log("Creating/updating admin user document")
        await setDoc(
          doc(db, "users", currentUser.uid),
          {
            email: currentUser.email,
            userType: "admin",
            name: userDoc.exists() ? userDoc.data().name : "Admin",
            isAdmin: true,
            createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )

        console.log("Admin document created successfully")
        setSuccess(true)
        setTimeout(() => {
          navigate("/admindashboard")
        }, 2000)
      } catch (err) {
        console.error("Setup error:", err)
        setError(`Setup failed: ${err.message}. Error code: ${err.code || "unknown"}`)
      } finally {
        setLoading(false)
      }
    }

    setupAdminPermissions()
  }, [currentUser, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up admin permissions...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
          <p className="text-gray-600">Redirecting to admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
          <div className="text-center mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Setup Error</h2>
          </div>

          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">{error}</div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Quick Fix - Use These Permissive Rules:</h3>

            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
              <p className="font-medium mb-2">Step 1: Go to Firebase Console → Firestore Database → Rules</p>
              <p className="mb-2">Step 2: Replace ALL existing rules with this:</p>

              <div className="bg-gray-900 text-green-400 p-4 rounded-md text-sm font-mono overflow-x-auto">
                <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}</pre>
              </div>

              <p className="mt-2 text-sm">Step 3: Click "Publish" and wait for deployment</p>
              <p className="text-sm">Step 4: Refresh this page</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
              <p className="text-sm">
                <strong>Note:</strong> These are very permissive rules for development only. Once everything is working,
                you can implement more secure rules.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default AdminSetup
