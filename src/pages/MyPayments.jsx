import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCreditCard, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa'
import { getMyPayments } from '../services/api'
import { format } from 'date-fns'

const MyPayments = () => {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const response = await getMyPayments()
      if (response.success && response.data) {
        setPayments(response.data)
      }
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="payments-container">
      <div className="payments-header">
        <button
          onClick={() => navigate(-1)}
          className="back-btn"
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '8px' }}
        >
          <FaArrowLeft />
        </button>
        <h1>Payment History</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <FaCreditCard size={64} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
          <h3>No Payments</h3>
          <p>You haven't made any payments yet</p>
        </div>
      ) : (
        <div className="payments-list">
          {payments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="payment-card"
            >
              <div className="payment-header-card">
                <div>
                  <div className="payment-invoice">{payment.invoice_number}</div>
                  {payment.fleet_name && (
                    <div className="payment-fleet">{payment.fleet_name}</div>
                  )}
                </div>
                <FaCheckCircle style={{ color: 'var(--success)', fontSize: '24px' }} />
              </div>

              <div className="payment-details">
                <div className="payment-detail-item">
                  <FaCalendarAlt />
                  <div>
                    <span className="detail-label">Payment Date</span>
                    <span className="detail-value">
                      {format(new Date(payment.payment_date), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="payment-footer-card">
                <span>Amount Paid</span>
                <span className="payment-amount">${payment.amount.toFixed(2)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style jsx>{`
        .payments-container {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 70px;
        }

        .payments-header {
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

        .payments-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .payments-header .back-btn {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .payments-list {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .payment-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .payment-header-card {
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border);
        }

        .payment-invoice {
          font-weight: 700;
          color: var(--text);
          font-size: 16px;
          margin-bottom: 4px;
        }

        .payment-fleet {
          font-size: 14px;
          color: var(--text-muted);
        }

        .payment-details {
          padding: 16px 20px;
        }

        .payment-detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .payment-detail-item svg {
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

        .payment-footer-card {
          padding: 16px 20px;
          background: var(--background-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border);
        }

        .payment-amount {
          font-size: 20px;
          font-weight: 700;
          color: var(--success);
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

export default MyPayments

