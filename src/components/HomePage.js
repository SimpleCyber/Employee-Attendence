import { Users, Clock, Shield, CheckCircle, ArrowRight, Star } from "lucide-react"
import { useNavigate  } from "react-router-dom"

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 backdrop-blur-md bg-white/80 border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center group">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors duration-200">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">AttendEase</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 inline-flex items-center"
              onClick={() => navigate("/auth")}
              >
                Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center relative">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute top-20 right-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="inline-flex items-center px-4 py-2 bg-indigo-100/80 rounded-full text-indigo-700 text-sm font-medium mb-8 backdrop-blur-sm">
            <Star className="h-4 w-4 mr-2" />
            Trusted by 500+ users worldwide
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Employee Attendance
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600"> Management System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Streamline your workforce management with our comprehensive attendance tracking system. Monitor employee
            attendance, manage staff, and maintain accurate records effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
            onClick={() => navigate("/auth")}
            >
              Get Started Free
              <CheckCircle className="ml-2 h-5 w-5" />
            </button>
            <button className="text-indigo-600 hover:text-indigo-700 px-8 py-4 rounded-lg text-lg font-medium transition-colors duration-200 inline-flex items-center hover:bg-indigo-50">
              Watch Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">99.9%</div>
              <div className="text-gray-600 mt-1">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-gray-600 mt-1">Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10+</div>
              <div className="text-gray-600 mt-1">Industries Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-gray-600 mt-1">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to manage attendance
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make workforce management simple and efficient
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-4 rounded-xl w-fit mb-6 group-hover:from-indigo-200 group-hover:to-blue-200 transition-colors duration-300">
              <Clock className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Attendance</h3>
            <p className="text-gray-600 leading-relaxed">
              Track employee attendance in real-time with photo verification and precise timestamp recording for complete accuracy.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-4 rounded-xl w-fit mb-6 group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors duration-300">
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Employee Management</h3>
            <p className="text-gray-600 leading-relaxed">
              Easily add, edit, and manage employee profiles with comprehensive admin controls and detailed insights.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-4 rounded-xl w-fit mb-6 group-hover:from-amber-200 group-hover:to-orange-200 transition-colors duration-300">
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Access</h3>
            <p className="text-gray-600 leading-relaxed">
              Role-based access control ensures data security with separate admin and employee portals for enhanced protection.
            </p>
          </div>
          
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold">AttendEase</span>
            </div>
            <div className="text-gray-400 text-sm">
              © AttendEase. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage