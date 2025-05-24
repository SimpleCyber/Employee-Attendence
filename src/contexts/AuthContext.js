"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)

  async function signup(email, password, type, name) {
    try {
      console.log("Creating user account...")
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      console.log("User created, setting up document...")
      // Create user document
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        userType: type,
        name: name,
        createdAt: new Date().toISOString(),
      })

      console.log("User document created successfully")
      return userCredential
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  async function login(email, password) {
    try {
      console.log("Logging in user...")
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("Login successful")
      return userCredential
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  function logout() {
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out")

      if (user) {
        try {
          console.log("Fetching user document for:", user.uid)
          const userDoc = await getDoc(doc(db, "users", user.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            console.log("User data retrieved:", userData)
            setCurrentUser(user)
            setUserType(userData.userType)
          } else {
            console.log("User document doesn't exist")
            setCurrentUser(user)
            setUserType(null)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setCurrentUser(user)
          setUserType(null)
        }
      } else {
        setCurrentUser(null)
        setUserType(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userType,
    signup,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
