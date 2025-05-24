import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import HomePage from "./components/HomePage"
import AuthPage from "./components/AuthPage"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminSetup from "./components/AdminSetup"
import AdminDashboard from "./components/AdminDashboard"
import AddEmployee from "./components/AddEmployee"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/admin-setup"
              element={
                <ProtectedRoute>
                  <AdminSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admindashboard"
              element={
                <ProtectedRoute userType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/addemployee"
              element={
                <ProtectedRoute userType="admin">
                  <AddEmployee />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
