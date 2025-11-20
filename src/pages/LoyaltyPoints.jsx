import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaStar, FaTrophy, FaGift, FaDollarSign } from 'react-icons/fa'
import { getLoyaltyPoints } from '../services/api'

const LoyaltyPoints = () => {
  const navigate = useNavigate()
  const [loyaltyData, setLoyaltyData] = useState({
    loyalty_points: 0,
    total_spent: 0,
    next_reward_at: 0,
    total_bookings: 0,
    completed_bookings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLoyaltyData()
  }, [])

  const loadLoyaltyData = async () => {
    try {
      setLoading(true)
      const response = await getLoyaltyPoints()
      if (response.success && response.data) {
        setLoyaltyData(response.data)
      }
    } catch (error) {
      console.error('Error loading loyalty data:', error)
    } finally {
      setLoading(false)
    }
  }

  const progressPercentage = loyaltyData.total_spent > 0
    ? Math.min(100, (loyaltyData.total_spent / ((loyaltyData.loyalty_points + 1) * 10)) * 100)
    : 0

  return (
    <div className="loyalty-container">
      <div className="loyalty-header">
        <button
          onClick={() => navigate(-1)}
          className="back-btn"
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '8px' }}
        >
          <FaArrowLeft />
        </button>
        <h1>Loyalty Points</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading loyalty data...</p>
        </div>
      ) : (
        <>
          {/* Points Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="points-card"
          >
            <div className="points-icon">
              <FaStar size={48} />
            </div>
            <div className="points-value">{loyaltyData.loyalty_points}</div>
            <div className="points-label">Loyalty Points</div>
          </motion.div>

          {/* Progress to Next Reward */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="progress-card"
          >
            <div className="progress-header">
              <span>Next Reward</span>
              <span className="next-points">{loyaltyData.loyalty_points + 1} Points</span>
            </div>
            <div className="progress-bar-container">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="progress-bar"
              />
            </div>
            <div className="progress-footer">
              <span>${loyaltyData.total_spent.toFixed(2)} spent</span>
              <span>${loyaltyData.next_reward_at.toFixed(2)} to next point</span>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="stats-section">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="stat-item"
            >
              <FaDollarSign size={24} />
              <div className="stat-content">
                <div className="stat-value">${loyaltyData.total_spent.toFixed(2)}</div>
                <div className="stat-label">Total Spent</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="stat-item"
            >
              <FaTrophy size={24} />
              <div className="stat-content">
                <div className="stat-value">{loyaltyData.total_bookings}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="stat-item"
            >
              <FaGift size={24} />
              <div className="stat-content">
                <div className="stat-value">{loyaltyData.completed_bookings}</div>
                <div className="stat-label">Completed</div>
              </div>
            </motion.div>
          </div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="info-card"
          >
            <h3>How It Works</h3>
            <ul className="info-list">
              <li>Earn 1 point for every $10 spent</li>
              <li>Points never expire</li>
              <li>Redeem points for discounts on future bookings</li>
              <li>Complete bookings to earn bonus points</li>
            </ul>
          </motion.div>
        </>
      )}

      <style jsx>{`
        .loyalty-container {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 70px;
        }

        .loyalty-header {
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

        .loyalty-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .loyalty-header .back-btn {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .points-card {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          margin: 20px;
          padding: 40px 20px;
          border-radius: 20px;
          text-align: center;
          box-shadow: var(--shadow-gold);
        }

        .points-icon {
          margin-bottom: 16px;
        }

        .points-icon svg {
          color: var(--black);
        }

        .points-value {
          font-size: 64px;
          font-weight: 900;
          color: var(--black);
          margin-bottom: 8px;
        }

        .points-label {
          font-size: 18px;
          color: var(--black);
          font-weight: 600;
        }

        .progress-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          margin: 0 20px 20px;
          box-shadow: var(--shadow);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .progress-header span:first-child {
          color: var(--text);
          font-weight: 600;
        }

        .next-points {
          color: var(--primary);
          font-weight: 700;
        }

        .progress-bar-container {
          height: 12px;
          background: var(--background-light);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--primary-light));
          border-radius: 6px;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }

        .progress-footer {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-muted);
        }

        .stats-section {
          padding: 0 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow);
        }

        .stat-item svg {
          color: var(--primary);
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-muted);
        }

        .info-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          margin: 0 20px;
          box-shadow: var(--shadow);
        }

        .info-card h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--text);
        }

        .info-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .info-list li {
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
          color: var(--text);
        }

        .info-list li:last-child {
          border-bottom: none;
        }

        .info-list li::before {
          content: '✓ ';
          color: var(--primary);
          font-weight: 700;
          margin-right: 8px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}

export default LoyaltyPoints

