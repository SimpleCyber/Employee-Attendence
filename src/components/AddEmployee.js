"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"
import { ArrowLeft, Plus, Edit, Trash2, Users, Mail, User } from "lucide-react"

function AddEmployee() {
  const [employees, setEmployees] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const employeesSnapshot = await getDocs(collection(db, "employees"))
      const employeesList = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setEmployees(employeesList)
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      if (editingId) {
        await updateDoc(doc(db, "employees", editingId), {
          ...formData,
          updatedAt: new Date().toISOString(),
        })
        setMessage("Employee updated successfully!")
        setEditingId(null)
      } else {
        await addDoc(collection(db, "employees"), {
          ...formData,
          createdAt: new Date().toISOString(),
        })
        setMessage("Employee added successfully!")
      }

      setFormData({ name: "", email: "", position: "", department: "" })
      fetchEmployees()
    } catch (error) {
      setMessage("Error: " + error.message)
    }
    setLoading(false)
  }

  const handleEdit = (employee) => {
    setFormData({
      name: employee.name,
      email: employee.email,
      position: employee.position,
      department: employee.department,
    })
    setEditingId(employee.id)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteDoc(doc(db, "employees", id))
        setMessage("Employee deleted successfully!")
        fetchEmployees()
      } catch (error) {
        setMessage("Error deleting employee: " + error.message)
      }
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ name: "", email: "", position: "", department: "" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/admindashboard" className="text-gray-500 hover:text-gray-700 mr-4">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <Users className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                {editingId ? "Edit Employee" : "Add Employee"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add/Edit Employee Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {editingId ? "Edit Employee" : "Add New Employee"}
            </h2>

            {message && (
              <div
                className={`mb-4 p-3 rounded-md ${
                  message.includes("Error")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Enter employee name"
                  />
                </div>
              </div>

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
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <input
                  type="text"
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter position"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter department"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium transition duration-200 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      {editingId ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {editingId ? "Update Employee" : "Add Employee"}
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Employee List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Employee List</h2>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {employees.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No employees added yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <div key={employee.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{employee.name}</h3>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                          <p className="text-xs text-gray-400">
                            {employee.position} • {employee.department}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddEmployee
