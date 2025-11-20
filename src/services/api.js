import axios from 'axios'

// Auto-detect API URL based on current host
const getApiBaseUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // Use production API URL
  return 'https://nuhigreattravels.com/api/v1'
  
  // Auto-detect from current host (for development)
  // const hostname = window.location.hostname
  // const protocol = window.location.protocol
  // 
  // // If accessing from IP address (mobile), use same IP for API
  // if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
  //   return `${protocol}//${hostname}:8000/api/v1`
  // }
  // 
  // // Default to localhost for development
  // return 'http://localhost:8000/api/v1'
}

const API_BASE_URL = getApiBaseUrl()

// Log API URL for debugging
console.log('API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data,
    })
    
    // Show user-friendly error messages
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - API server may be unreachable')
    } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('Network error - Check if API server is running at:', API_BASE_URL)
      console.error('Make sure Laravel server is running with: php artisan serve --host=0.0.0.0')
    } else if (error.response?.status === 404) {
      console.error('API endpoint not found (404):', error.config?.baseURL + error.config?.url)
    } else if (error.response?.status >= 500) {
      console.error('Server error (5xx):', error.response?.status)
    }
    
    // Keep original error structure for proper handling
    return Promise.reject(error)
  }
)

export const getCars = async () => {
  try {
    const response = await api.get('/cars')
    return response.data
  } catch (error) {
    console.error('Error fetching cars:', error)
    return { success: false, data: [], message: error.message || 'Failed to fetch cars' }
  }
}

export const getFleets = async (params = {}) => {
  try {
    const response = await api.get('/fleets', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching fleets:', error)
    return { success: false, data: [], message: error.message || 'Failed to fetch fleets' }
  }
}

export const getFleet = async (id) => {
  try {
    const response = await api.get(`/fleets/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching fleet:', error)
    return { success: false, data: null, message: error.message || 'Failed to fetch fleet' }
  }
}

export const calculatePrice = async (fleetId, pickupDate, dropoffDate) => {
  const response = await api.post('/calculate-price', {
    fleet_id: fleetId,
    pickup_datetime: pickupDate,
    dropoff_datetime: dropoffDate,
  })
  return response.data
}

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData)
  return response.data
}

export const getBooking = async (id) => {
  const response = await api.get(`/bookings/${id}`)
  return response.data
}

export const getSettings = async () => {
  try {
    const response = await api.get('/settings')
    return response.data
  } catch (error) {
    console.error('Error fetching settings:', error)
    return { 
      success: false, 
      data: { logo: null, name: 'Nuhi Great Travels' }, 
      message: error.message || 'Failed to fetch settings' 
    }
  }
}

// Authentication
export const register = async (userData) => {
  const response = await api.post('/register', userData)
  return response.data
}

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password })
  return response.data
}

export const googleLogin = async (googleData) => {
  const response = await api.post('/google-login', googleData)
  return response.data
}

export const logout = async () => {
  const response = await api.post('/logout')
  return response.data
}

// User Account (requires auth)
export const getProfile = async () => {
  const response = await api.get('/profile')
  return response.data
}

export const updateProfile = async (profileData) => {
  const response = await api.put('/profile', profileData)
  return response.data
}

export const getMyBookings = async () => {
  const response = await api.get('/my-bookings')
  return response.data
}

export const getMyInvoices = async () => {
  const response = await api.get('/my-invoices')
  return response.data
}

export const getMyPayments = async () => {
  const response = await api.get('/my-payments')
  return response.data
}

export const getLoyaltyPoints = async () => {
  const response = await api.get('/loyalty-points')
  return response.data
}

// Set auth token for authenticated requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('auth_token', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('auth_token')
  }
}

// Get auth token from storage
export const getAuthToken = () => {
  return localStorage.getItem('auth_token')
}

// Initialize auth token on app load
const savedToken = getAuthToken()
if (savedToken) {
  setAuthToken(savedToken)
}

export default api

