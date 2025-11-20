import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaCheckCircle, FaHome, FaCalendarAlt } from 'react-icons/fa'
import { useBooking } from '../context/BookingContext'
import { useEffect } from 'react'

const BookingSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { resetBooking } = useBooking()
  const bookingId = location.state?.bookingId

  useEffect(() => {
    // Reset booking context after showing success
    const timer = setTimeout(() => {
      resetBooking()
    }, 5000)

    return () => clearTimeout(timer)
  }, [resetBooking])

  return (
    <div className="success-container">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="success-icon"
      >
        <FaCheckCircle />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="success-title"
      >
        Booking Confirmed!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="success-message"
      >
        Your booking has been successfully submitted. We'll send you a confirmation email shortly.
      </motion.p>

      {bookingId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="booking-id"
        >
          <span>Booking ID: </span>
          <strong>#{bookingId}</strong>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="success-actions"
      >
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '12px' }}
        >
          <FaHome /> Back to Home
        </button>
        <button
          onClick={() => navigate('/fleets')}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          <FaCalendarAlt /> Book Another Vehicle
        </button>
      </motion.div>

      <style jsx>{`
        .success-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, var(--black) 0%, var(--background-light) 100%);
          color: var(--text);
          text-align: center;
          border-top: 3px solid var(--primary);
        }

        .success-icon {
          font-size: 120px;
          color: #10b981;
          margin-bottom: 24px;
          background: white;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .success-title {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .success-message {
          font-size: 18px;
          margin-bottom: 32px;
          opacity: 0.9;
          max-width: 400px;
          line-height: 1.6;
        }

        .booking-id {
          background: rgba(255, 255, 255, 0.2);
          padding: 12px 24px;
          border-radius: 12px;
          margin-bottom: 32px;
          font-size: 16px;
        }

        .booking-id strong {
          font-size: 18px;
          font-weight: 700;
        }

        .success-actions {
          width: 100%;
          max-width: 400px;
        }

        .success-actions .btn {
          font-size: 16px;
          padding: 14px 24px;
        }

        @media (max-width: 768px) {
          .success-icon {
            font-size: 80px;
            width: 120px;
            height: 120px;
          }

          .success-title {
            font-size: 28px;
          }

          .success-message {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  )
}

export default BookingSuccess

