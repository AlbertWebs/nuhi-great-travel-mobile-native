import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaReceipt, FaCreditCard, FaStar, FaEdit, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { getMyBookings, getMyInvoices, getMyPayments, getLoyaltyPoints } from '../services/api'

const Profile = () => {
  const navigate = useNavigate()
  const { user, logout, loadUserProfile } = useAuth()
  const [stats, setStats] = useState({
    bookings: 0,
    invoices: 0,
    payments: 0,
    loyaltyPoints: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadStats()
  }, [user])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [bookingsRes, invoicesRes, paymentsRes, loyaltyRes] = await Promise.all([
        getMyBookings(),
        getMyInvoices(),
        getMyPayments(),
        getLoyaltyPoints(),
      ])

      setStats({
        bookings: bookingsRes.data?.length || 0,
        invoices: invoicesRes.data?.length || 0,
        payments: paymentsRes.data?.length || 0,
        loyaltyPoints: loyaltyRes.data?.loyalty_points || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <button
          onClick={() => navigate(-1)}
          className="back-btn"
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '8px' }}
        >
          <FaArrowLeft />
        </button>
        <h1>My Account</h1>
        <button
          onClick={() => navigate('/profile/edit')}
          className="edit-btn"
          style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '8px', color: 'var(--primary)' }}
        >
          <FaEdit />
        </button>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="profile-card"
      >
        <div className="profile-card-background"></div>
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            {user.photo ? (
              <img src={user.photo} alt={user.name} />
            ) : (
              <FaUser size={48} />
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="edit-avatar-btn"
            onClick={() => navigate('/profile/edit')}
          >
            <FaEdit size={14} />
          </motion.button>
        </div>
        <h2>{user.name}</h2>
        <div className="profile-info">
          <p className="profile-email">
            <FaEnvelope size={14} /> {user.email}
          </p>
          {user.phone && (
            <p className="profile-phone">
              <FaPhone size={14} /> {user.phone}
            </p>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="stat-card"
          onClick={() => navigate('/my-bookings')}
        >
          <FaCalendarAlt size={24} />
          <div className="stat-value">{stats.bookings}</div>
          <div className="stat-label">Bookings</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="stat-card"
          onClick={() => navigate('/my-invoices')}
        >
          <FaReceipt size={24} />
          <div className="stat-value">{stats.invoices}</div>
          <div className="stat-label">Invoices</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="stat-card"
          onClick={() => navigate('/my-payments')}
        >
          <FaCreditCard size={24} />
          <div className="stat-value">{stats.payments}</div>
          <div className="stat-label">Payments</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="stat-card"
          onClick={() => navigate('/loyalty')}
        >
          <FaStar size={24} />
          <div className="stat-value">{stats.loyaltyPoints}</div>
          <div className="stat-label">Points</div>
        </motion.div>
      </div>

      {/* Menu Items */}
      <div className="menu-section">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="menu-item"
          onClick={() => navigate('/my-bookings')}
        >
          <FaCalendarAlt />
          <span>My Bookings</span>
          <span className="menu-arrow">›</span>
        </motion.div>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="menu-item"
          onClick={() => navigate('/my-invoices')}
        >
          <FaReceipt />
          <span>My Invoices</span>
          <span className="menu-arrow">›</span>
        </motion.div>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="menu-item"
          onClick={() => navigate('/my-payments')}
        >
          <FaCreditCard />
          <span>Payment History</span>
          <span className="menu-arrow">›</span>
        </motion.div>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="menu-item"
          onClick={() => navigate('/loyalty')}
        >
          <FaStar />
          <span>Loyalty Points</span>
          <span className="menu-arrow">›</span>
        </motion.div>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="menu-item"
          onClick={() => navigate('/profile/edit')}
        >
          <FaEdit />
          <span>Edit Profile</span>
          <span className="menu-arrow">›</span>
        </motion.div>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="menu-item logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </motion.div>
      </div>

      <style jsx>{`
        .profile-container {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 70px;
        }

        .profile-header {
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

        .profile-header h1 {
          font-size: 22px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.3px;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        .profile-header .back-btn {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .profile-card {
          background: linear-gradient(135deg, var(--surface) 0%, rgba(255, 215, 0, 0.05) 100%);
          border-bottom: 2px solid rgba(255, 215, 0, 0.2);
          padding: 40px 20px 32px;
          text-align: center;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }

        .profile-card-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%);
          z-index: 0;
        }

        .profile-avatar-container {
          position: relative;
          display: inline-block;
          margin-bottom: 20px;
          z-index: 1;
        }

        .profile-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, #FFA500 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--black);
          box-shadow: 0 8px 30px rgba(255, 215, 0, 0.4), 0 0 0 4px rgba(255, 215, 0, 0.2);
          border: 4px solid var(--surface);
          overflow: hidden;
          position: relative;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .edit-avatar-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          border: 3px solid var(--surface);
          color: var(--black);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
          z-index: 2;
        }

        .profile-card h2 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 16px;
          color: var(--text);
          position: relative;
          z-index: 1;
          letter-spacing: -0.5px;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .profile-email,
        .profile-phone {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          margin: 0;
        }

        .profile-email svg,
        .profile-phone svg {
          color: var(--primary);
          opacity: 0.8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 0 20px 24px;
        }

        .stat-card {
          background: linear-gradient(135deg, var(--surface) 0%, rgba(255, 215, 0, 0.03) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 20px 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--primary), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .stat-card:hover {
          border-color: rgba(255, 215, 0, 0.4);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.2), 0 0 40px rgba(255, 215, 0, 0.1);
          transform: translateY(-4px);
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-card svg {
          color: var(--primary);
          margin-bottom: 12px;
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.4));
          transition: all 0.3s ease;
        }

        .stat-card:hover svg {
          transform: scale(1.15);
          filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.6));
        }

        .stat-value {
          font-size: 28px;
          font-weight: 900;
          color: var(--text);
          margin-bottom: 6px;
          letter-spacing: -1px;
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .menu-section {
          padding: 0 20px 20px;
        }

        .menu-item {
          background: var(--surface);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 18px 20px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .menu-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--primary);
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }

        .menu-item:hover {
          border-color: rgba(255, 215, 0, 0.3);
          background: linear-gradient(90deg, rgba(255, 215, 0, 0.05) 0%, var(--surface) 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1);
          transform: translateX(4px);
        }

        .menu-item:hover::before {
          transform: scaleY(1);
        }

        .menu-item svg {
          font-size: 22px;
          color: var(--primary);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .menu-item:hover svg {
          transform: scale(1.1);
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
        }

        .menu-item span:first-of-type {
          flex: 1;
          font-weight: 600;
          color: var(--text);
          font-size: 15px;
          letter-spacing: 0.2px;
        }

        .menu-arrow {
          font-size: 24px;
          color: var(--text-muted);
          transition: all 0.3s ease;
        }

        .menu-item:hover .menu-arrow {
          color: var(--primary);
          transform: translateX(4px);
        }

        .menu-item.logout {
          border-color: rgba(255, 68, 68, 0.3);
          margin-top: 8px;
        }

        .menu-item.logout:hover {
          border-color: var(--error);
          background: linear-gradient(90deg, rgba(255, 68, 68, 0.1) 0%, var(--surface) 100%);
        }

        .menu-item.logout::before {
          background: var(--error);
        }

        .menu-item.logout svg {
          color: var(--error);
        }

        .menu-item.logout span {
          color: var(--error);
        }

        @media (max-width: 768px) {
          .profile-card {
            padding: 36px 20px 28px;
          }

          .profile-avatar {
            width: 100px;
            height: 100px;
          }

          .profile-card h2 {
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .stat-card {
            padding: 18px 10px;
          }

          .stat-value {
            font-size: 24px;
          }

          .stat-label {
            font-size: 10px;
          }

          .menu-item {
            padding: 16px 18px;
          }
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-container p {
          color: var(--text-muted);
          font-size: 16px;
        }
      `}</style>
    </div>
  )
}

export default Profile

