import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaCog, FaGasPump, FaCheck } from 'react-icons/fa'
import { getFleet } from '../services/api'
import { useBooking } from '../context/BookingContext'

const FleetDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { updateBooking } = useBooking()
  const [fleet, setFleet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    loadFleet()
  }, [id])

  const loadFleet = async () => {
    try {
      setLoading(true)
      const response = await getFleet(id)
      setFleet(response.data)
      if (response.data.images && response.data.images.length > 0) {
        setSelectedImage(0)
      }
    } catch (error) {
      console.error('Error loading fleet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (fleet) {
      updateBooking({ fleet })
      navigate('/booking')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading vehicle details...</p>
      </div>
    )
  }

  if (!fleet) {
    return (
      <div className="error-container">
        <h2>Vehicle not found</h2>
        <button onClick={() => navigate('/fleets')} className="btn btn-primary">
          Back to Fleet
        </button>
      </div>
    )
  }

  const allImages = fleet.image ? [fleet.image, ...(fleet.images || [])] : (fleet.images || [])

  return (
    <div className="fleet-detail-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="detail-header"
      >
        <button
          onClick={() => navigate(-1)}
          className="back-btn"
        >
          <FaArrowLeft />
        </button>
        <h1>{fleet.name}</h1>
        <div style={{ width: '40px' }}></div>
      </motion.div>

      {/* Image Gallery */}
      {allImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="image-gallery"
        >
          <div className="main-image">
            <img src={allImages[selectedImage]} alt={fleet.name} />
          </div>
          {allImages.length > 1 && (
            <div className="image-thumbnails">
              {allImages.map((img, index) => (
                <motion.img
                  key={index}
                  src={img}
                  alt={`${fleet.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="detail-content"
      >
        <div className="price-section">
          <div>
            <span className="price-amount">${typeof fleet.price_per_day === 'number' 
              ? fleet.price_per_day.toFixed(2) 
              : parseFloat(fleet.price_per_day || 0).toFixed(2)}</span>
            <span className="price-unit">/day</span>
          </div>
          {fleet.car && (
            <span className="category-badge">{fleet.car.make}</span>
          )}
        </div>

        {fleet.description && (
          <div className="description-section">
            <h3>Description</h3>
            <p>{fleet.description}</p>
          </div>
        )}

        {/* Specifications */}
        <div className="specs-section">
          <h3>Specifications</h3>
          <div className="specs-grid">
            {fleet.seats && (
              <div className="spec-item">
                <FaUsers />
                <div>
                  <span className="spec-label">Seats</span>
                  <span className="spec-value">{fleet.seats}</span>
                </div>
              </div>
            )}
            {fleet.transmission && (
              <div className="spec-item">
                <FaCog />
                <div>
                  <span className="spec-label">Transmission</span>
                  <span className="spec-value">{fleet.transmission}</span>
                </div>
              </div>
            )}
            {fleet.fuel_type && (
              <div className="spec-item">
                <FaGasPump />
                <div>
                  <span className="spec-label">Fuel Type</span>
                  <span className="spec-value">{fleet.fuel_type}</span>
                </div>
              </div>
            )}
            {fleet.year && (
              <div className="spec-item">
                <FaCalendarAlt />
                <div>
                  <span className="spec-label">Year</span>
                  <span className="spec-value">{fleet.year}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="features-section">
          <h3>Features</h3>
          <div className="features-list">
            <div className="feature-item">
              <FaCheck /> <span>Air Conditioning</span>
            </div>
            <div className="feature-item">
              <FaCheck /> <span>GPS Navigation</span>
            </div>
            <div className="feature-item">
              <FaCheck /> <span>Bluetooth</span>
            </div>
            <div className="feature-item">
              <FaCheck /> <span>Insurance Included</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Book Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="book-footer"
      >
        <button
          onClick={handleBookNow}
          className="btn btn-primary book-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaCalendarAlt /> Book Now
        </button>
      </motion.div>

      <style jsx>{`
        .fleet-detail-container {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 140px; /* Space for book button + bottom nav */
        }

        .detail-header {
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
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .detail-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .image-gallery {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }

        .main-image {
          width: 100%;
          height: 300px;
          overflow: hidden;
          background: var(--border);
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-thumbnails {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          overflow-x: auto;
        }

        .image-thumbnails img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 12px;
          border: 3px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .image-thumbnails img.active {
          border-color: var(--primary);
        }

        .detail-content {
          padding: 0 20px;
        }

        .price-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding: 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow);
        }

        .price-amount {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary);
        }

        .price-unit {
          font-size: 16px;
          color: var(--text-light);
          margin-left: 4px;
        }

        .category-badge {
          background: var(--primary);
          color: var(--black);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: var(--shadow-gold);
        }

        .description-section,
        .specs-section,
        .features-section {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 16px;
          box-shadow: var(--shadow);
        }

        .description-section h3,
        .specs-section h3,
        .features-section h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--text);
        }

        .description-section p {
          line-height: 1.6;
          color: var(--text-light);
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .spec-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--background-light);
          border: 1px solid var(--border);
          border-radius: 12px;
        }

        .spec-item svg {
          font-size: 24px;
          color: var(--primary);
        }

        .spec-item div {
          display: flex;
          flex-direction: column;
        }

        .spec-label {
          font-size: 12px;
          color: var(--text-light);
          margin-bottom: 4px;
        }

        .spec-value {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text);
        }

        .feature-item svg {
          color: var(--success);
        }

        .book-footer {
          position: fixed;
          bottom: 70px; /* Above bottom nav */
          left: 0;
          right: 0;
          background: var(--surface);
          border-top: 1px solid var(--border);
          padding: 16px 20px;
          box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.5), 0 -1px 0 rgba(255, 215, 0, 0.1);
          z-index: 10;
        }

        .book-btn {
          width: 100%;
          font-size: 18px;
          padding: 16px;
          gap: 12px;
        }

        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          text-align: center;
        }

        .error-container h2 {
          margin-bottom: 20px;
          color: var(--text);
        }

        @media (max-width: 768px) {
          .main-image {
            height: 250px;
          }

          .specs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default FleetDetail

