import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaCog, FaGasPump, FaCheck, FaCar } from 'react-icons/fa'
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
      <div className="fleet-detail-container">
        {/* Header Skeleton */}
        <div className="detail-header">
          <div className="skeleton-back-btn"></div>
          <div className="skeleton-title"></div>
          <div style={{ width: '40px' }}></div>
        </div>

        {/* Image Gallery Skeleton */}
        <div className="image-gallery-skeleton">
          <div className="skeleton-main-image"></div>
          <div className="skeleton-thumbnails">
            <div className="skeleton-thumbnail"></div>
            <div className="skeleton-thumbnail"></div>
            <div className="skeleton-thumbnail"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="detail-content-skeleton">
          <div className="skeleton-price-section"></div>
          <div className="skeleton-section">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
          <div className="skeleton-section">
            <div className="skeleton-grid">
              <div className="skeleton-spec"></div>
              <div className="skeleton-spec"></div>
              <div className="skeleton-spec"></div>
              <div className="skeleton-spec"></div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        <div className="loading-overlay">
          <div className="elegant-loader">
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-center">
              <FaCar />
            </div>
          </div>
          <p className="loading-text">Loading vehicle details...</p>
        </div>
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
          <div className="main-image-container">
            <div className="main-image">
              <img src={allImages[selectedImage]} alt={fleet.name} />
            </div>
            {allImages.length > 1 && (
              <>
                <button
                  className="image-nav-btn prev-btn"
                  onClick={() => setSelectedImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  className="image-nav-btn next-btn"
                  onClick={() => setSelectedImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                  aria-label="Next image"
                >
                  →
                </button>
                <div className="image-counter">
                  {selectedImage + 1} / {allImages.length}
                </div>
              </>
            )}
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
            <span className="price-amount">KES {typeof fleet.price_per_day === 'number' 
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
        {(fleet.seats || fleet.transmission || fleet.fuel_type || fleet.year) && (
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
        )}

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
          background: linear-gradient(180deg, var(--background) 0%, var(--background-light) 100%);
          padding-bottom: 180px; /* Space for book button + bottom nav + extra margin */
        }

        .detail-header {
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.9) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 2px solid rgba(255, 215, 0, 0.2);
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 215, 0, 0.1);
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
          font-size: 22px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.3px;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        .image-gallery {
          background: var(--surface);
          border-bottom: 2px solid rgba(255, 215, 0, 0.2);
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .main-image-container {
          position: relative;
          width: 100%;
        }

        .main-image {
          width: 100%;
          height: 350px;
          overflow: hidden;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          position: relative;
        }

        .main-image::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
          z-index: 1;
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .main-image:hover img {
          transform: scale(1.05);
        }

        .image-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .image-nav-btn:hover {
          background: rgba(0, 0, 0, 0.8);
          border-color: var(--primary);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
          transform: translateY(-50%) scale(1.1);
        }

        .image-nav-btn.prev-btn {
          left: 16px;
        }

        .image-nav-btn.next-btn {
          right: 16px;
        }

        .image-counter {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 2;
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
          border-radius: 14px;
          border: 3px solid transparent;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0.7;
        }

        .image-thumbnails img:hover {
          opacity: 1;
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        }

        .image-thumbnails img.active {
          border-color: var(--primary);
          opacity: 1;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 4px 15px rgba(255, 215, 0, 0.3);
          transform: scale(1.05);
        }

        .detail-content {
          padding: 0 20px;
          margin-bottom: 100px; /* Extra space to prevent overlap */
        }

        .price-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding: 16px 18px;
          background: linear-gradient(135deg, var(--surface) 0%, rgba(255, 215, 0, 0.05) 100%);
          border: 2px solid rgba(255, 215, 0, 0.3);
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.1), 0 0 40px rgba(255, 215, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .price-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--primary), transparent);
        }

        .price-amount {
          font-size: 36px;
          font-weight: 900;
          color: var(--primary);
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          letter-spacing: -1px;
        }

        .price-unit {
          font-size: 14px;
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
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 28px 24px;
          border-radius: 20px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .description-section::before,
        .specs-section::before,
        .features-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--primary), transparent);
          opacity: 0.5;
        }

        .description-section:hover,
        .specs-section:hover,
        .features-section:hover {
          border-color: rgba(255, 215, 0, 0.3);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.2), 0 0 40px rgba(255, 215, 0, 0.1);
          transform: translateY(-2px);
        }

        .description-section h3,
        .specs-section h3,
        .features-section h3 {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 20px;
          color: var(--text);
          letter-spacing: -0.5px;
          position: relative;
          padding-bottom: 12px;
        }

        .description-section h3::after,
        .specs-section h3::after,
        .features-section h3::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background: linear-gradient(90deg, var(--primary), transparent);
          border-radius: 2px;
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
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 215, 0, 0.02) 100%);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .spec-item:hover {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
          border-color: rgba(255, 215, 0, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
        }

        .spec-item svg {
          font-size: 28px;
          color: var(--primary);
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.4));
          transition: all 0.3s ease;
        }

        .spec-item:hover svg {
          transform: scale(1.1);
          filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.6));
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
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: 0.3px;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          color: var(--text);
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.3s ease;
          margin-bottom: 8px;
        }

        .feature-item:last-child {
          margin-bottom: 0;
        }

        .feature-item:hover {
          background: rgba(255, 215, 0, 0.1);
          transform: translateX(8px);
        }

        .feature-item svg {
          color: var(--primary);
          font-size: 18px;
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
          flex-shrink: 0;
        }

        .book-footer {
          position: fixed;
          bottom: 70px; /* Above bottom nav */
          left: 0;
          right: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%);
          backdrop-filter: blur(20px);
          border-top: 2px solid rgba(255, 215, 0, 0.3);
          padding: 20px;
          box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.6), 0 -2px 0 rgba(255, 215, 0, 0.2), 0 0 60px rgba(255, 215, 0, 0.1);
          z-index: 10;
        }

        .book-btn {
          width: 100%;
          font-size: 18px;
          font-weight: 700;
          padding: 16px;
          gap: 10px;
          letter-spacing: 0.3px;
          background: linear-gradient(135deg, var(--primary) 0%, #FFA500 100%);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .book-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 215, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .book-btn:active {
          transform: translateY(0);
        }

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

        /* Loading Skeleton Styles */
        .image-gallery-skeleton {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }

        .skeleton-main-image {
          width: 100%;
          height: 300px;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 215, 0, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 0;
        }

        .skeleton-thumbnails {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
        }

        .skeleton-thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 215, 0, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-thumbnail:nth-child(2) {
          animation-delay: 0.2s;
        }

        .skeleton-thumbnail:nth-child(3) {
          animation-delay: 0.4s;
        }

        .skeleton-back-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 215, 0, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-title {
          width: 200px;
          height: 24px;
          border-radius: 8px;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 215, 0, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .detail-content-skeleton {
          padding: 0 20px;
        }

        .skeleton-price-section {
          height: 80px;
          border-radius: 16px;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 215, 0, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          margin-bottom: 24px;
        }

        .skeleton-section {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 16px;
        }

        .skeleton-line {
          height: 16px;
          border-radius: 8px;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 215, 0, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          margin-bottom: 12px;
        }

        .skeleton-line:last-child {
          margin-bottom: 0;
        }

        .skeleton-line.short {
          width: 60%;
        }

        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .skeleton-spec {
          height: 80px;
          border-radius: 12px;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 215, 0, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-spec:nth-child(2) {
          animation-delay: 0.15s;
        }

        .skeleton-spec:nth-child(3) {
          animation-delay: 0.3s;
        }

        .skeleton-spec:nth-child(4) {
          animation-delay: 0.45s;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Elegant Loader */
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .elegant-loader {
          position: relative;
          width: 120px;
          height: 120px;
          margin-bottom: 24px;
        }

        .loader-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .loader-ring:nth-child(1) {
          animation-duration: 1.2s;
        }

        .loader-ring:nth-child(2) {
          width: 80%;
          height: 80%;
          top: 10%;
          left: 10%;
          border-top-color: rgba(255, 215, 0, 0.7);
          animation-duration: 1s;
          animation-direction: reverse;
        }

        .loader-ring:nth-child(3) {
          width: 60%;
          height: 60%;
          top: 20%;
          left: 20%;
          border-top-color: rgba(255, 215, 0, 0.5);
          animation-duration: 0.8s;
        }

        .loader-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--primary);
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
        }

        .loading-text {
          color: var(--text);
          font-size: 16px;
          font-weight: 500;
          letter-spacing: 0.5px;
          opacity: 0.9;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .main-image {
            height: 280px;
          }

          .skeleton-main-image {
            height: 280px;
          }

          .detail-content {
            margin-bottom: 120px;
          }

          .image-nav-btn {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }

          .image-nav-btn.prev-btn {
            left: 12px;
          }

          .image-nav-btn.next-btn {
            right: 12px;
          }

          .image-counter {
            bottom: 12px;
            right: 12px;
            font-size: 12px;
            padding: 4px 10px;
          }

          .specs-grid {
            grid-template-columns: 1fr;
          }

          .skeleton-grid {
            grid-template-columns: 1fr;
          }

          .elegant-loader {
            width: 100px;
            height: 100px;
          }

          .loader-center {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .loading-text {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  )
}

export default FleetDetail

