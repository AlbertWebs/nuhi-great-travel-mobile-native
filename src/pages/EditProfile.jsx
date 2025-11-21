import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaPhone, FaLock, FaArrowLeft, FaSave } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../services/api'

const EditProfile = () => {
  const navigate = useNavigate()
  const { user, updateUser, loadUserProfile } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      confirmPassword: '',
    })
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password && formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await updateProfile(updateData)
      
      if (response.success) {
        updateUser(response.data)
        await loadUserProfile()
        setSuccess('Profile updated successfully!')
        setTimeout(() => navigate('/profile'), 1500)
      } else {
        setError(response.message || 'Update failed')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Update failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-header">
        <button
          onClick={() => navigate(-1)}
          className="back-btn"
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '8px' }}
        >
          <FaArrowLeft />
        </button>
        <h1>Edit Profile</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="edit-content"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="error-message"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="success-message"
          >
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaUser /> Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaEnvelope /> Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaPhone /> Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
            />
          </div>

          <div className="form-group">
            <label>
              <FaLock /> New Password (Leave blank to keep current)
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
              minLength={8}
            />
          </div>

          {formData.password && (
            <div className="form-group">
              <label>
                <FaLock /> Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input"
                minLength={8}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>

      <style jsx>{`
        .edit-profile-container {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 70px;
        }

        .edit-header {
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 2px solid rgba(255, 215, 0, 0.2);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 215, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .edit-header h1 {
          font-size: 22px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.3px;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        .edit-header .back-btn {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .edit-content {
          padding: 24px 20px;
          max-width: 520px;
          margin: 0 auto;
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
          border-radius: 14px;
          color: var(--text);
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1), 0 4px 20px rgba(255, 215, 0, 0.2);
        }

        .error-message {
          background: rgba(255, 68, 68, 0.15);
          border: 2px solid var(--error);
          color: var(--error);
          padding: 14px 16px;
          border-radius: 14px;
          margin-bottom: 24px;
          font-size: 14px;
          backdrop-filter: blur(10px);
        }

        .success-message {
          background: rgba(16, 185, 129, 0.15);
          border: 2px solid var(--success);
          color: var(--success);
          padding: 14px 16px;
          border-radius: 14px;
          margin-bottom: 24px;
          font-size: 14px;
          backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  )
}

export default EditProfile

