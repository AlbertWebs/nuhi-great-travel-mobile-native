import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaReceipt, FaCalendarAlt, FaDollarSign } from 'react-icons/fa'
import { getMyInvoices } from '../services/api'
import { format } from 'date-fns'

const MyInvoices = () => {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const response = await getMyInvoices()
      if (response.success && response.data) {
        setInvoices(response.data)
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'var(--success)'
      case 'pending':
        return 'var(--primary)'
      case 'cancelled':
        return 'var(--error)'
      default:
        return 'var(--text-muted)'
    }
  }

  return (
    <div className="invoices-container">
      <div className="invoices-header">
        <button
          onClick={() => navigate(-1)}
          className="back-btn"
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '8px' }}
        >
          <FaArrowLeft />
        </button>
        <h1>My Invoices</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="empty-state">
          <FaReceipt size={64} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
          <h3>No Invoices</h3>
          <p>You don't have any invoices yet</p>
        </div>
      ) : (
        <div className="invoices-list">
          {invoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="invoice-card"
            >
              <div className="invoice-header-card">
                <div>
                  <div className="invoice-number">{invoice.invoice_number}</div>
                  {invoice.fleet_name && (
                    <div className="invoice-fleet">{invoice.fleet_name}</div>
                  )}
                </div>
                <span
                  className="invoice-status"
                  style={{ background: getStatusColor(invoice.status) + '20', color: getStatusColor(invoice.status) }}
                >
                  {invoice.status}
                </span>
              </div>

              <div className="invoice-details">
                <div className="invoice-detail-item">
                  <FaCalendarAlt />
                  <div>
                    <span className="detail-label">Pickup Date</span>
                    <span className="detail-value">
                      {format(new Date(invoice.pickup_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
                <div className="invoice-detail-item">
                  <FaCalendarAlt />
                  <div>
                    <span className="detail-label">Dropoff Date</span>
                    <span className="detail-value">
                      {format(new Date(invoice.dropoff_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
                <div className="invoice-detail-item">
                  <FaDollarSign />
                  <div>
                    <span className="detail-label">Days</span>
                    <span className="detail-value">{invoice.days} {invoice.days === 1 ? 'day' : 'days'}</span>
                  </div>
                </div>
              </div>

              <div className="invoice-footer-card">
                <span>Total Amount</span>
                <span className="invoice-price">${typeof invoice.total_price === 'number' 
                  ? invoice.total_price.toFixed(2) 
                  : parseFloat(invoice.total_price || 0).toFixed(2)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style jsx>{`
        .invoices-container {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 70px;
        }

        .invoices-header {
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

        .invoices-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .invoices-header .back-btn {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .invoices-list {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .invoice-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .invoice-header-card {
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border);
        }

        .invoice-number {
          font-weight: 700;
          color: var(--text);
          font-size: 16px;
          margin-bottom: 4px;
        }

        .invoice-fleet {
          font-size: 14px;
          color: var(--text-muted);
        }

        .invoice-status {
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .invoice-details {
          padding: 16px 20px;
        }

        .invoice-detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .invoice-detail-item:last-child {
          margin-bottom: 0;
        }

        .invoice-detail-item svg {
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

        .invoice-footer-card {
          padding: 16px 20px;
          background: var(--background-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border);
        }

        .invoice-price {
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

export default MyInvoices

