import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import { getMyBookings } from '../services/api'
import { format } from 'date-fns'

const MyBookings = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await getMyBookings()
      if (response.success && response.data) {
        setBookings(response.data)
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'var(--success)'
      case 'pending':
        return 'var(--primary)'
      case 'cancelled':
        return 'var(--error)'
      case 'completed':
        return 'var(--text-muted)'
      default:
        return 'var(--text-muted)'
    }
  }

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <button
          onClick={() => navigate(-1)}
          className="back-btn"
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '8px' }}
        >
          <FaArrowLeft />
        </button>
        <h1>My Bookings</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <FaCalendarAlt size={64} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
          <h3>No Bookings Yet</h3>
          <p>You haven't made any bookings yet</p>
          <button
            onClick={() => navigate('/booking')}
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
          >
            Book Now
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="booking-card"
            >
              <div className="booking-header-card">
                <div className="booking-id">Booking #{booking.id}</div>
                <span
                  className="booking-status"
                  style={{ background: getStatusColor(booking.status) + '20', color: getStatusColor(booking.status) }}
                >
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <div className="booking-detail-item">
                  <FaCalendarAlt />
                  <div>
                    <span className="detail-label">Pickup</span>
                    <span className="detail-value">
                      {format(new Date(booking.pickup_datetime), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
                <div className="booking-detail-item">
                  <FaClock />
                  <div>
                    <span className="detail-label">Dropoff</span>
                    <span className="detail-value">
                      {format(new Date(booking.dropoff_datetime), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
                <div className="booking-detail-item">
                  <FaMapMarkerAlt />
                  <div>
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{booking.pickup_location}</span>
                  </div>
                </div>
              </div>

              {booking.total_price && (
                <div className="booking-footer-card">
                  <span>Total</span>
                  <span className="booking-price">KES {typeof booking.total_price === 'number' 
                    ? booking.total_price.toFixed(2) 
                    : parseFloat(booking.total_price || 0).toFixed(2)}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <style jsx>{`
        .bookings-container {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 70px;
        }

        .bookings-header {
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

        .bookings-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .bookings-header .back-btn {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .bookings-list {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .booking-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .booking-header-card {
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
        }

        .booking-id {
          font-weight: 700;
          color: var(--text);
          font-size: 16px;
        }

        .booking-status {
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .booking-details {
          padding: 16px 20px;
        }

        .booking-detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .booking-detail-item:last-child {
          margin-bottom: 0;
        }

        .booking-detail-item svg {
          color: var(--primary);
          font-size: 18px;
        }

        .detail-label {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .detail-value {
          display: block;
          font-size: 14px;
          color: var(--text);
          font-weight: 500;
        }

        .booking-footer-card {
          padding: 16px 20px;
          background: var(--background-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border);
        }

        .booking-price {
          font-size: 20px;
          font-weight: 700;
          color: var(--primary);
        }

        .loading-container,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .empty-state h3 {
          margin-bottom: 8px;
          color: var(--text);
        }

        .empty-state p {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  )
}

export default MyBookings

