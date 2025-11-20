import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowLeft, FaGoogle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { googleLogin, setAuthToken } from '../services/api'

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    })
    
    if (result.success) {
      navigate('/profile')
    } else {
      setError(result.message || 'Registration failed')
      if (result.errors) {
        setErrors(result.errors)
      }
    }
    
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    try {
      setError('')
      setLoading(true)

      // Wait for Google Sign-In library to load
      if (!window.google) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleCallback,
        })
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setError('Google Sign-In popup was blocked. Please allow popups and try again.')
            setLoading(false)
          }
        })
      } else {
        setError('Google Sign-In not available. Please check your configuration.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Google login error:', error)
      setError('Google login failed. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleCallback = async (response) => {
    try {
      // Decode the credential (JWT)
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      
      const googleData = {
        email: payload.email,
        name: payload.name,
        google_id: payload.sub,
        photo: payload.picture,
      }

      const result = await googleLogin(googleData)
      
      if (result.success && result.data) {
        // Store token and reload to update auth state
        setAuthToken(result.data.token)
        navigate('/profile')
        setTimeout(() => window.location.reload(), 500) // Reload to update auth state
      } else {
        setError('Google login failed')
        setLoading(false)
      }
    } catch (error) {
      console.error('Google callback error:', error)
      setError('Failed to process Google login')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <button
        onClick={() => navigate(-1)}
        className="back-btn"
        style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '16px 20px', color: 'var(--text)' }}
      >
        <FaArrowLeft />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <h1>Create Account</h1>
        <p className="auth-subtitle">Sign up to get started</p>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="error-message"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaUser /> Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
            {errors.name && <span className="field-error">{errors.name[0]}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaEnvelope /> Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              required
            />
            {errors.email && <span className="field-error">{errors.email[0]}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaPhone /> Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
            />
          </div>

          <div className="form-group">
            <label>
              <FaLock /> Password
            </label>
            <input
              type="password"
              placeholder="Enter your password (min 8 characters)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
              required
              minLength={8}
            />
            {errors.password && <span className="field-error">{errors.password[0]}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaLock /> Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="btn btn-google"
          disabled={loading}
          style={{ width: '100%', marginTop: '20px' }}
        >
          <FaGoogle /> Continue with Google
        </button>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign In
          </Link>
        </p>
      </motion.div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--black) 0%, var(--background-light) 100%);
          display: flex;
          flex-direction: column;
          padding-bottom: 70px;
          position: relative;
          overflow: hidden;
        }

        .auth-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.3;
          z-index: 0;
        }

        .back-btn {
          position: relative;
          z-index: 1;
        }

        .auth-card {
          flex: 1;
          max-width: 420px;
          width: 100%;
          margin: 0 auto;
          padding: 40px 24px;
          position: relative;
          z-index: 1;
        }

        .auth-card h1 {
          font-size: 36px;
          font-weight: 900;
          margin-bottom: 12px;
          color: var(--text);
          text-align: center;
          background: linear-gradient(90deg, var(--text), var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-subtitle {
          text-align: center;
          color: var(--text-muted);
          margin-bottom: 40px;
          font-size: 16px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          margin-bottom: 10px;
          color: var(--text);
          font-size: 14px;
        }

        .form-group label svg {
          color: var(--primary);
          font-size: 16px;
        }

        .input {
          width: 100%;
          padding: 14px 16px;
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: var(--shadow);
        }

        .input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1), var(--shadow-gold);
        }

        .field-error {
          display: block;
          color: var(--error);
          font-size: 12px;
          margin-top: 6px;
          font-weight: 500;
        }

        .error-message {
          background: rgba(255, 68, 68, 0.15);
          border: 2px solid var(--error);
          color: var(--error);
          padding: 14px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
          backdrop-filter: blur(10px);
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 28px 0;
          color: var(--text-muted);
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border);
        }

        .divider span {
          padding: 0 16px;
          font-size: 13px;
          font-weight: 600;
        }

        .btn-google {
          background: #ffffff;
          color: #333333;
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: var(--shadow);
        }

        .btn-google:hover {
          background: #f5f5f5;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .btn-google svg {
          font-size: 20px;
          color: #4285F4;
        }

        .auth-footer {
          text-align: center;
          margin-top: 28px;
          color: var(--text-muted);
          font-size: 14px;
        }

        .auth-footer a {
          transition: all 0.3s ease;
        }

        .auth-footer a:hover {
          color: var(--primary);
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
      `}</style>
    </div>
  )
}

export default Register

