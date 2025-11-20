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
        <div className="profile-avatar">
          <FaUser size={48} />
        </div>
        <h2>{user.name}</h2>
        <p className="profile-email">{user.email}</p>
        {user.phone && <p className="profile-phone">{user.phone}</p>}
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
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .profile-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .profile-header .back-btn {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .profile-card {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 32px 20px;
          text-align: center;
          margin-bottom: 20px;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: var(--black);
          box-shadow: var(--shadow-gold);
        }

        .profile-card h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text);
        }

        .profile-email,
        .profile-phone {
          color: var(--text-muted);
          margin: 4px 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 0 20px 20px;
        }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 16px 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-gold);
        }

        .stat-card svg {
          color: var(--primary);
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .menu-section {
          padding: 0 20px;
        }

        .menu-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .menu-item:hover {
          border-color: var(--primary);
          background: var(--surface-light);
        }

        .menu-item svg {
          font-size: 20px;
          color: var(--primary);
        }

        .menu-item span:first-of-type {
          flex: 1;
          font-weight: 600;
          color: var(--text);
        }

        .menu-arrow {
          font-size: 24px;
          color: var(--text-muted);
        }

        .menu-item.logout {
          border-color: var(--error);
        }

        .menu-item.logout svg {
          color: var(--error);
        }

        .menu-item.logout span {
          color: var(--error);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .stat-card {
            padding: 12px 6px;
          }

          .stat-value {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default Profile

