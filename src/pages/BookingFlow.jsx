import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaCheck, FaCreditCard, FaClock } from 'react-icons/fa'
import { useBooking } from '../context/BookingContext'
import { calculatePrice, createBooking, sendPaymentEmail } from '../services/api'
import { format, addDays } from 'date-fns'

const BookingFlow = () => {
  const navigate = useNavigate()
  const { bookingData, updateBooking } = useBooking()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    pickupDate: bookingData.pickupDate || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    dropoffDate: bookingData.dropoffDate || format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
    pickupLocation: bookingData.pickupLocation || '',
    dropoffLocation: bookingData.dropoffLocation || '',
    fullName: bookingData.customerInfo?.fullName || '',
    email: bookingData.customerInfo?.email || '',
    mobile: bookingData.customerInfo?.mobile || '',
    paymentPreference: bookingData.paymentPreference || 'pay_later',
  })

  useEffect(() => {
    if (!bookingData.fleet) {
      navigate('/fleets')
    }
  }, [bookingData.fleet, navigate])

  useEffect(() => {
    if (step === 1 && formData.pickupDate && formData.dropoffDate && bookingData.fleet) {
      calculatePriceData()
    }
  }, [formData.pickupDate, formData.dropoffDate])

  const calculatePriceData = async () => {
    try {
      const response = await calculatePrice(
        bookingData.fleet.id,
        formData.pickupDate,
        formData.dropoffDate
      )
      updateBooking({
        totalPrice: response.data.total_price,
        days: response.data.days,
      })
    } catch (error) {
      console.error('Error calculating price:', error)
    }
  }

  const handleNext = async () => {
    setError('')
    
    if (step === 1) {
      if (!formData.pickupDate || !formData.dropoffDate || !formData.pickupLocation) {
        setError('Please fill in all required fields')
        return
      }
      updateBooking({
        pickupDate: formData.pickupDate,
        dropoffDate: formData.dropoffDate,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
      })
      setStep(2)
    } else if (step === 2) {
      if (!formData.fullName || !formData.email || !formData.mobile) {
        setError('Please fill in all required fields')
        return
      }
      updateBooking({
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
        },
      })
      setStep(3)
    } else if (step === 3) {
      updateBooking({
        paymentPreference: formData.paymentPreference,
      })
      setStep(4)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const bookingPayload = {
        fleet_id: bookingData.fleet.id,
        pickup_datetime: formData.pickupDate,
        dropoff_datetime: formData.dropoffDate,
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation || formData.pickupLocation,
        full_name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        payment_preference: formData.paymentPreference,
      }

      const response = await createBooking(bookingPayload)
      
      // If pay now, send payment email and navigate to payment page
      if (formData.paymentPreference === 'pay_now') {
        try {
          // Send payment email with payment details and link
          await sendPaymentEmail(response.data.id)
          console.log('Payment email sent successfully')
        } catch (emailError) {
          console.error('Error sending payment email:', emailError)
          // Continue even if email fails - don't block the user
        }
        
        // Navigate to Pesapal payment page
        if (response.data.payment_url) {
          navigate(`/payment/pesapal?booking_id=${response.data.id}&payment_url=${encodeURIComponent(response.data.payment_url)}`)
        } else {
          // If no payment URL, still navigate to payment page with booking ID
          navigate(`/payment/pesapal?booking_id=${response.data.id}`)
        }
        return
      }
      
      navigate('/booking/success', { state: { bookingId: response.data.id } })
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create booking. Please try again.')
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Date & Location' },
    { number: 2, title: 'Your Details' },
    { number: 3, title: 'Payment' },
    { number: 4, title: 'Review & Confirm' },
  ]

  return (
    <div className="booking-flow-container">
      {/* Header */}
      <div className="booking-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft />
        </button>
        <h1>Book Vehicle</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        {steps.map((s, index) => (
          <div key={s.number} className="step-item">
            <div className={`step-circle ${step >= s.number ? 'active' : ''}`}>
              {step > s.number ? <FaCheck /> : s.number}
            </div>
            <span className={`step-label ${step >= s.number ? 'active' : ''}`}>
              {s.title}
            </span>
            {index < steps.length - 1 && (
              <div className={`step-line ${step > s.number ? 'active' : ''}`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="booking-step"
          >
            <h2>When and Where?</h2>
            <div className="form-group">
              <label>
                <FaCalendarAlt /> Pickup Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                className="input"
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              />
            </div>
            <div className="form-group">
              <label>
                <FaCalendarAlt /> Dropoff Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.dropoffDate}
                onChange={(e) => setFormData({ ...formData, dropoffDate: e.target.value })}
                className="input"
                min={formData.pickupDate}
              />
            </div>
            <div className="form-group">
              <label>
                <FaMapMarkerAlt /> Pickup Location
              </label>
              <input
                type="text"
                placeholder="Enter pickup location"
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>
                <FaMapMarkerAlt /> Dropoff Location (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter dropoff location"
                value={formData.dropoffLocation}
                onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                className="input"
              />
            </div>
            {bookingData.totalPrice > 0 && (
              <div className="price-preview">
                <div className="price-info">
                  <span>{bookingData.days} {bookingData.days === 1 ? 'day' : 'days'}</span>
                  <span className="price">KES {typeof bookingData.totalPrice === 'number' 
                    ? bookingData.totalPrice.toFixed(2) 
                    : parseFloat(bookingData.totalPrice || 0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="booking-step"
          >
            <h2>Your Information</h2>
            <div className="form-group">
              <label>
                <FaUser /> Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input"
              />
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
              />
            </div>
            <div className="form-group">
              <label>
                <FaPhone /> Mobile Number
              </label>
              <input
                type="tel"
                placeholder="Enter your mobile number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="input"
              />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="booking-step"
          >
            <h2>Payment Option</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
              Choose how you'd like to pay for this booking
            </p>
            
            <div className="payment-options">
              <motion.div
                className={`payment-option ${formData.paymentPreference === 'pay_now' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, paymentPreference: 'pay_now' })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="payment-icon">
                  <FaCreditCard />
                </div>
                <div className="payment-content">
                  <h3>Pay Now</h3>
                  <p>Complete payment immediately using Pesapal</p>
                </div>
                {formData.paymentPreference === 'pay_now' && (
                  <div className="payment-check">
                    <FaCheck />
                  </div>
                )}
              </motion.div>

              <motion.div
                className={`payment-option ${formData.paymentPreference === 'pay_later' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, paymentPreference: 'pay_later' })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="payment-icon">
                  <FaClock />
                </div>
                <div className="payment-content">
                  <h3>Pay Later</h3>
                  <p>Pay when you pick up the vehicle</p>
                </div>
                {formData.paymentPreference === 'pay_later' && (
                  <div className="payment-check">
                    <FaCheck />
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="booking-step"
          >
            <h2>Review Your Booking</h2>
            {bookingData.fleet && (
              <div className="review-card">
                <div className="review-image">
                  {bookingData.fleet.image && (
                    <img src={bookingData.fleet.image} alt={bookingData.fleet.name} />
                  )}
                </div>
                <div className="review-content">
                  <h3>{bookingData.fleet.name}</h3>
                  <div className="review-details">
                    <p><FaCalendarAlt /> {format(new Date(formData.pickupDate), 'MMM dd, yyyy HH:mm')}</p>
                    <p><FaCalendarAlt /> {format(new Date(formData.dropoffDate), 'MMM dd, yyyy HH:mm')}</p>
                    <p><FaMapMarkerAlt /> {formData.pickupLocation}</p>
                    <p><FaUser /> {formData.fullName}</p>
                    <p><FaEnvelope /> {formData.email}</p>
                    <p><FaPhone /> {formData.mobile}</p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-light)' }}>
                      {formData.paymentPreference === 'pay_now' ? <FaCreditCard /> : <FaClock />}
                      Payment: {formData.paymentPreference === 'pay_now' ? 'Pay Now' : 'Pay Later'}
                    </p>
                  </div>
                  <div className="review-total">
                    <span>Total</span>
                    <span className="total-price">KES {typeof bookingData.totalPrice === 'number' 
                      ? bookingData.totalPrice.toFixed(2) 
                      : parseFloat(bookingData.totalPrice || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-message"
        >
          {error}
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="booking-footer">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={handleNext}
            className="btn btn-primary"
            style={{ flex: step === 1 ? 1 : 2 }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? 'Processing...' : formData.paymentPreference === 'pay_now' ? 'Proceed to Payment' : 'Confirm Booking'}
          </button>
        )}
      </div>

      <style jsx>{`
        .booking-flow-container {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 100px;
        }

        .booking-header {
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

        .booking-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          padding: 24px 20px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          margin-bottom: 20px;
        }

        .step-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--surface-light);
          border: 2px solid var(--border);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 8px;
          transition: all 0.3s ease;
        }

        .step-circle.active {
          background: var(--primary);
          border-color: var(--primary);
          color: var(--black);
          box-shadow: var(--shadow-gold);
        }

        .step-label {
          font-size: 12px;
          color: var(--text-light);
          text-align: center;
          transition: all 0.3s ease;
        }

        .step-label.active {
          color: var(--text);
          font-weight: 600;
        }

        .step-line {
          position: absolute;
          top: 20px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: var(--border);
          z-index: -1;
        }

        .step-line.active {
          background: var(--primary);
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }

        .booking-step {
          padding: 0 20px;
        }

        .booking-step h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 24px;
          color: var(--text);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text);
        }

        .price-preview {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 20px;
          border-radius: 16px;
          box-shadow: var(--shadow);
          margin-top: 20px;
        }

        .price-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .price-info .price {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
        }

        .review-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .review-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: var(--border);
        }

        .review-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .review-content {
          padding: 20px;
        }

        .review-content h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--text);
        }

        .review-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .review-details p {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-light);
        }

        .review-details svg {
          color: var(--primary);
        }

        .review-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 2px solid var(--border);
        }

        .review-total span:first-child {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .total-price {
          font-size: 28px;
          font-weight: 700;
          color: var(--primary);
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .payment-option {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .payment-option:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow);
        }

        .payment-option.selected {
          border-color: var(--primary);
          background: rgba(255, 215, 0, 0.1);
          box-shadow: var(--shadow-gold);
        }

        .payment-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: var(--primary);
          color: var(--black);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .payment-content {
          flex: 1;
        }

        .payment-content h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
          color: var(--text);
        }

        .payment-content p {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
        }

        .payment-check {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary);
          color: var(--black);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .error-message {
          background: rgba(255, 68, 68, 0.15);
          border: 1px solid var(--error);
          color: var(--error);
          padding: 12px 20px;
          margin: 0 20px 20px;
          border-radius: 12px;
          font-size: 14px;
        }

        .booking-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--surface);
          border-top: 1px solid var(--border);
          padding: 16px 20px;
          box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.5), 0 -1px 0 rgba(255, 215, 0, 0.1);
          display: flex;
          gap: 12px;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .step-label {
            font-size: 10px;
          }

          .step-circle {
            width: 36px;
            height: 36px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  )
}

export default BookingFlow

