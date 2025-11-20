import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import FleetList from './pages/FleetList'
import CarsList from './pages/CarsList'
import FleetDetail from './pages/FleetDetail'
import BookingFlow from './pages/BookingFlow'
import BookingSuccess from './pages/BookingSuccess'
import PesapalPayment from './pages/PesapalPayment'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import MyBookings from './pages/MyBookings'
import MyInvoices from './pages/MyInvoices'
import MyPayments from './pages/MyPayments'
import LoyaltyPoints from './pages/LoyaltyPoints'
import { BookingProvider } from './context/BookingContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import ErrorBoundary from './components/ErrorBoundary'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <BookingProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<CarsList />} />
            <Route path="/fleets" element={<FleetList />} />
            <Route path="/fleets/:id" element={<FleetDetail />} />
            <Route path="/booking" element={<BookingFlow />} />
            <Route path="/booking/success" element={<BookingSuccess />} />
            <Route path="/payment/pesapal" element={<PesapalPayment />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/my-invoices" element={<ProtectedRoute><MyInvoices /></ProtectedRoute>} />
            <Route path="/my-payments" element={<ProtectedRoute><MyPayments /></ProtectedRoute>} />
            <Route path="/loyalty" element={<ProtectedRoute><LoyaltyPoints /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
        <BottomNav />
        <InstallPrompt />
      </Router>
    </BookingProvider>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

