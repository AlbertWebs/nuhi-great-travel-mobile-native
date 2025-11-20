import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, logout as apiLogout, getProfile, setAuthToken, getAuthToken } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const token = getAuthToken()
    if (token) {
      setAuthToken(token)
      loadUserProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await getProfile()
      if (response.success && response.data) {
        setUser(response.data)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Token might be invalid, clear it
      setAuthToken(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password)
      if (response.success && response.data) {
        setAuthToken(response.data.token)
        setUser(response.data.user)
        setIsAuthenticated(true)
        return { success: true }
      }
      return { success: false, message: response.message || 'Login failed' }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await apiRegister(userData)
      if (response.success && response.data) {
        setAuthToken(response.data.token)
        setUser(response.data.user)
        setIsAuthenticated(true)
        return { success: true }
      }
      return { success: false, message: response.message || 'Registration failed' }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.',
        errors: error.response?.data?.errors
      }
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuthToken(null)
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      setIsAuthenticated,
      login,
      register,
      logout,
      updateUser,
      loadUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

