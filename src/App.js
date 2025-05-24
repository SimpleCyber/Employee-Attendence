import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import HomePage from "./components/HomePage"
import AuthPage from "./components/AuthPage"
import AdminDashboard from "./components/AdminDashboard"
import AddEmployee from "./components/AddEmployee"
import EmployeeHome from "./components/EmployeeHome"
import CalendarView from "./components/CalendarView"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminSetup from "./components/AdminSetup"

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
            <Route
              path="/employeehome"
              element={
                <ProtectedRoute userType="employee">
                  <EmployeeHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar/:employeeId"
              element={
                <ProtectedRoute>
                  <CalendarView />
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
