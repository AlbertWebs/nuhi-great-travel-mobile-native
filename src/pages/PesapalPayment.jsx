import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { getBooking, generatePaymentUrl } from '../services/api'

const PesapalPayment = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('booking_id')
  const paymentUrl = searchParams.get('payment_url')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState(null) // 'pending', 'success', 'failed'

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails(false)
    } else if (paymentUrl) {
      // If payment URL is provided directly, use it
      setLoading(false)
    } else {
      setError('Missing booking ID or payment URL')
      setLoading(false)
    }
  }, [bookingId, paymentUrl])

  const loadBookingDetails = async (tryGenerateUrl = false) => {
    try {
      const response = await getBooking(bookingId)
      if (response.success && response.data) {
        setBooking(response.data)
        // If booking has payment URL, use it
        if (response.data.payment_url) {
          setLoading(false)
        } else {
          // Check if booking is already paid or doesn't require payment
          if (response.data.payment_status === 'paid' || response.data.payment_status === 'completed') {
            setError('This booking has already been paid')
            setLoading(false)
          } else if (response.data.payment_preference === 'pay_later') {
            setError('This booking is set to "Pay Later". Payment is not required at this time.')
            setLoading(false)
          } else if (tryGenerateUrl && response.data.payment_preference === 'pay_now') {
            // Try to generate payment URL if it's a pay_now booking
            try {
              const paymentResponse = await generatePaymentUrl(bookingId)
              if (paymentResponse.success && paymentResponse.data?.payment_url) {
                // Reload booking to get updated payment URL
                await loadBookingDetails(false)
              } else {
                setError('Unable to generate payment URL. Please contact support or try booking again.')
                setLoading(false)
              }
            } catch (genError) {
              console.error('Error generating payment URL:', genError)
              setError('Payment URL is not available. Please contact support or try booking again.')
              setLoading(false)
            }
          } else {
            setError('Payment URL is not available. Please contact support or try booking again.')
            setLoading(false)
          }
        }
      } else {
        setError('Failed to load booking details. Please check your booking ID and try again.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error loading booking:', error)
      setError('Unable to load booking details. Please check your connection and try again.')
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentStatus('success')
    // Redirect to success page after 3 seconds
    setTimeout(() => {
      navigate('/booking/success', { 
        state: { 
          bookingId: bookingId,
          paymentCompleted: true 
        } 
      })
    }, 3000)
  }

  const handlePaymentFailure = () => {
    setPaymentStatus('failed')
  }

  // Listen for messages from Pesapal iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Verify origin for security
      if (event.origin !== window.location.origin && !event.origin.includes('pesapal')) {
        return
      }

      if (event.data && event.data.type === 'pesapal_payment') {
        if (event.data.status === 'success' || event.data.status === 'completed') {
          handlePaymentSuccess()
        } else if (event.data.status === 'failed' || event.data.status === 'cancelled') {
          handlePaymentFailure()
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const finalPaymentUrl = paymentUrl || booking?.payment_url

  return (
    <div className="pesapal-payment-container">
      {/* Header */}
      <div className="payment-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft />
        </button>
        <h1>Complete Payment</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner-icon" />
          <p>Loading payment...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <FaTimesCircle className="error-icon" />
          <h2>Payment Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            {bookingId && booking?.payment_preference === 'pay_now' && (
              <button 
                onClick={() => {
                  setLoading(true)
                  setError('')
                  loadBookingDetails(true)
                }} 
                className="btn btn-secondary"
              >
                Generate Payment Link
              </button>
            )}
            {bookingId && (
              <button 
                onClick={() => {
                  setLoading(true)
                  setError('')
                  loadBookingDetails(false)
                }} 
                className="btn btn-secondary"
              >
                Retry
              </button>
            )}
            <button onClick={() => navigate('/my-bookings')} className="btn btn-primary">
              View My Bookings
            </button>
          </div>
        </div>
      ) : paymentStatus === 'success' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="success-container"
        >
          <FaCheckCircle className="success-icon" />
          <h2>Payment Successful!</h2>
          <p>Your payment has been processed successfully. Redirecting...</p>
        </motion.div>
      ) : paymentStatus === 'failed' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="error-container"
        >
          <FaTimesCircle className="error-icon" />
          <h2>Payment Failed</h2>
          <p>Your payment could not be processed. Please try again.</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry Payment
          </button>
        </motion.div>
      ) : finalPaymentUrl ? (
        <div className="payment-content">
          {booking && (
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <div className="summary-details">
                {booking.fleet_name && (
                  <p><strong>Vehicle:</strong> {booking.fleet_name}</p>
                )}
                {booking.total_price && (
                  <p><strong>Amount:</strong> KES {typeof booking.total_price === 'number' 
                    ? booking.total_price.toFixed(2) 
                    : parseFloat(booking.total_price || 0).toFixed(2)}</p>
                )}
                {booking.booking_id && (
                  <p><strong>Booking ID:</strong> #{booking.booking_id}</p>
                )}
              </div>
            </div>
          )}

          <div className="payment-iframe-container">
            <iframe
              src={finalPaymentUrl}
              title="Pesapal Payment"
              className="payment-iframe"
              allow="payment"
              sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups"
            />
          </div>

          <div className="payment-info">
            <p>Complete your payment using the secure Pesapal payment gateway above.</p>
            <p className="payment-note">Do not close this page until payment is complete.</p>
          </div>
        </div>
      ) : (
        <div className="error-container">
          <FaTimesCircle className="error-icon" />
          <h2>Payment URL Not Available</h2>
          <p>Unable to load payment page. This may happen if:</p>
          <ul className="error-list">
            <li>The payment link has expired</li>
            <li>The booking has already been paid</li>
            <li>The booking is set to "Pay Later"</li>
          </ul>
          <div className="error-actions">
            {bookingId && (
              <>
                <button 
                  onClick={() => {
                    setLoading(true)
                    setError('')
                    loadBookingDetails(true)
                  }} 
                  className="btn btn-secondary"
                >
                  Generate Payment Link
                </button>
                <button 
                  onClick={() => {
                    setLoading(true)
                    setError('')
                    loadBookingDetails(false)
                  }} 
                  className="btn btn-secondary"
                >
                  Retry
                </button>
              </>
            )}
            <button onClick={() => navigate('/my-bookings')} className="btn btn-primary">
              View My Bookings
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .pesapal-payment-container {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 20px;
        }

        .payment-header {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .back-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: var(--text);
          cursor: pointer;
          padding: 8px;
        }

        .payment-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .loading-container,
        .error-container,
        .success-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .spinner-icon {
          font-size: 48px;
          color: var(--primary);
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-icon,
        .success-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .error-icon {
          color: var(--error);
        }

        .success-icon {
          color: var(--success);
        }

        .error-container h2,
        .success-container h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text);
        }

        .error-container p,
        .success-container p {
          color: var(--text-muted);
          margin-bottom: 24px;
          font-size: 16px;
          line-height: 1.6;
        }

        .error-list {
          text-align: left;
          color: var(--text-muted);
          margin: 20px auto 24px;
          padding-left: 24px;
          max-width: 400px;
          font-size: 14px;
          line-height: 1.8;
        }

        .error-list li {
          margin-bottom: 8px;
        }

        .error-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
          max-width: 400px;
        }

        .error-actions .btn {
          flex: 1;
          min-width: 140px;
        }

        .payment-content {
          padding: 20px;
        }

        .booking-summary {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: var(--shadow);
        }

        .booking-summary h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--text);
        }

        .summary-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .summary-details p {
          display: flex;
          justify-content: space-between;
          color: var(--text-light);
          font-size: 14px;
        }

        .summary-details strong {
          color: var(--text);
          font-weight: 600;
        }

        .payment-iframe-container {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
          margin-bottom: 20px;
          min-height: 600px;
        }

        .payment-iframe {
          width: 100%;
          height: 600px;
          border: none;
          display: block;
        }

        .payment-info {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid var(--primary);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }

        .payment-info p {
          color: var(--text);
          font-size: 14px;
          margin: 8px 0;
        }

        .payment-note {
          color: var(--primary);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .payment-iframe {
            height: 500px;
          }

          .payment-iframe-container {
            min-height: 500px;
          }
        }
      `}</style>
    </div>
  )
}

export default PesapalPayment

