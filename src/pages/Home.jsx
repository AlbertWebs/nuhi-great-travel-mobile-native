import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaCar, FaSearch, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa'
import { getFleets, getSettings } from '../services/api'
import { useState, useEffect, useRef, useCallback } from 'react'

const Home = () => {
  const navigate = useNavigate()
  const [allFleets, setAllFleets] = useState([])
  const [displayedFleets, setDisplayedFleets] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 6
  const [settings, setSettings] = useState({ logo: null, name: 'Nuhi Great Travels' })
  const observerRef = useRef(null)
  const loadingRef = useRef(null)

  const loadMoreFleets = useCallback(async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const nextPage = currentPage + 1
      const startIndex = nextPage * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const nextFleets = allFleets.slice(startIndex, endIndex)
      
      if (nextFleets.length > 0) {
        setDisplayedFleets(prev => [...prev, ...nextFleets])
        setCurrentPage(nextPage)
        setHasMore(endIndex < allFleets.length)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more fleets:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, currentPage, allFleets])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fleetsRes, settingsRes] = await Promise.all([
          getFleets({ car_id: null }),
          getSettings()
        ])
        
        // Safely handle fleets response
        if (fleetsRes && fleetsRes.success && fleetsRes.data && Array.isArray(fleetsRes.data)) {
          setAllFleets(fleetsRes.data)
          // Load first 6 cars
          const initialFleets = fleetsRes.data.slice(0, itemsPerPage)
          setDisplayedFleets(initialFleets)
          setHasMore(fleetsRes.data.length > itemsPerPage)
          setCurrentPage(1)
        } else {
          console.warn('Fleets data not in expected format:', fleetsRes)
          setAllFleets([])
          setDisplayedFleets([])
          setHasMore(false)
        }
        
        // Safely handle settings response
        if (settingsRes && settingsRes.success && settingsRes.data) {
          setSettings(settingsRes.data)
          console.log('Settings loaded:', settingsRes.data)
        } else {
          console.warn('Settings data not in expected format:', settingsRes)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setAllFleets([])
        setDisplayedFleets([])
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadMoreFleets()
        }
      },
      { threshold: 0.1 }
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current)
      }
    }
  }, [hasMore, loading, loadingMore, loadMoreFleets])

  return (
    <div className="home-container">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="hero-section"
      >
        <div className="hero-content">
          {/* Logo */}
          {settings.logo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="hero-logo"
            >
              <img 
                src={settings.logo} 
                alt={settings.name || 'Logo'} 
                onError={(e) => {
                  console.error('Logo failed to load:', settings.logo)
                  e.target.style.display = 'none'
                }}
                onLoad={() => console.log('Logo loaded successfully:', settings.logo)}
              />
            </motion.div>
          )}
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hero-title"
          >
            Ride with a
            <span className="gradient-text"> touch of class</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="hero-buttons"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary hero-cta"
              onClick={() => navigate('/cars')}
            >
              <FaCar /> View Cars
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-secondary hero-cta"
              onClick={() => navigate('/fleets')}
            >
              <FaSearch /> Browse All
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="quick-actions"
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="action-card"
          onClick={() => navigate('/cars')}
        >
          <div className="action-icon">
            <FaCar />
          </div>
          <h3>View Cars</h3>
          <p>Browse by category</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="action-card"
          onClick={() => navigate('/booking')}
        >
          <div className="action-icon">
            <FaCalendarAlt />
          </div>
          <h3>Quick Book</h3>
          <p>Start booking now</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="action-card"
        >
          <div className="action-icon">
            <FaMapMarkerAlt />
          </div>
          <h3>Locations</h3>
          <p>Find us nearby</p>
        </motion.div>
      </motion.div>

      {/* All Vehicles with Infinite Scroll */}
      {!loading && displayedFleets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="featured-section"
        >
          <h2 className="section-title">Available Vehicles</h2>
          <div className="featured-grid">
            {displayedFleets.map((fleet, index) => (
              <motion.div
                key={fleet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + (index % 6) * 0.03, duration: 0.3 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="featured-card"
                onClick={() => navigate(`/fleets/${fleet.id}`)}
              >
                {fleet.image && (
                  <div className="featured-image">
                    <img src={fleet.image} alt={fleet.name} />
                  </div>
                )}
                <div className="featured-content">
                  <h3>{fleet.name}</h3>
                  <p className="featured-price">
                    ${typeof fleet.price_per_day === 'number' 
                      ? fleet.price_per_day.toFixed(2) 
                      : parseFloat(fleet.price_per_day || 0).toFixed(2)}<span className="price-unit">/day</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          {loadingMore && (
            <div className="loading-more">
              <div className="spinner"></div>
              <p className="loading-text">Loading more vehicles...</p>
            </div>
          )}
          {hasMore && <div ref={loadingRef} style={{ height: '20px' }}></div>}
        </motion.div>
      )}

      <style jsx>{`
        .home-container {
          min-height: 100vh;
          padding-bottom: 70px; /* Space for compact bottom nav */
        }

        .hero-section {
          background: linear-gradient(135deg, var(--black) 0%, var(--background-light) 100%);
          padding: 60px 20px 80px;
          text-align: center;
          color: var(--text);
          position: relative;
          overflow: hidden;
          border-bottom: 2px solid var(--primary);
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.3;
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        .hero-logo {
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-logo img {
          max-width: 180px;
          max-height: 80px;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
          display: block;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 900;
          margin-bottom: 20px;
          line-height: 1.1;
          letter-spacing: -1px;
          text-transform: uppercase;
        }

        .gradient-text {
          background: linear-gradient(90deg, var(--primary), var(--primary-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
          display: block;
          font-size: 56px;
          margin-top: 8px;
          filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
        }

        .hero-subtitle {
          font-size: 16px;
          margin-bottom: 28px;
          opacity: 0.85;
          font-weight: 400;
        }

        .hero-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          width: 100%;
          max-width: 100%;
        }

        .hero-cta {
          font-size: 14px;
          padding: 12px 20px;
          gap: 8px;
          flex: 1;
          max-width: 48%;
          min-width: 0;
        }

        .hero-cta svg {
          font-size: 16px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 24px 20px;
          max-width: 600px;
          margin: -40px auto 40px;
          position: relative;
          z-index: 2;
        }

        .action-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px 16px;
          text-align: center;
          box-shadow: var(--shadow);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-gold);
        }

        .action-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 12px;
          background: var(--primary);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--black);
          box-shadow: var(--shadow-gold);
        }

        .action-card h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text);
        }

        .action-card p {
          font-size: 12px;
          color: var(--text-muted);
        }

        .featured-section {
          padding: 0 20px;
          margin-top: 40px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text);
          text-align: center;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .loading-more {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 30px 20px;
          gap: 12px;
        }

        .loading-text {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .featured-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .featured-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-gold);
          transform: translateY(-2px);
        }

        .featured-card:active {
          transform: translateY(0);
        }

        .featured-image {
          width: 100%;
          height: 140px;
          overflow: hidden;
          background: var(--border);
          position: relative;
        }

        .featured-image::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 30px;
          background: linear-gradient(to top, rgba(0,0,0,0.1), transparent);
        }

        .featured-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }


        .featured-content {
          padding: 12px;
        }

        .featured-content h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .featured-price {
          font-size: 12px;
          font-weight: 700;
          color: var(--primary);
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
          display: flex;
          align-items: baseline;
          gap: 2px;
        }

        .price-unit {
          font-size: 10px;
          font-weight: 500;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }

          .gradient-text {
            font-size: 42px;
          }

          .hero-logo img {
            max-width: 150px;
            max-height: 60px;
          }

          .hero-cta {
            font-size: 13px;
            padding: 10px 16px;
          }

          .quick-actions {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            padding: 20px 16px;
          }

          .action-card {
            padding: 20px 12px;
          }

          .action-icon {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }

          .featured-content h3 {
            font-size: 13px;
          }

          .featured-price {
            font-size: 11px;
          }

          .price-unit {
            font-size: 9px;
          }

          .featured-image {
            height: 120px;
          }
        }

        @media (max-width: 360px) {
          .hero-title {
            font-size: 32px;
          }

          .gradient-text {
            font-size: 38px;
          }

          .hero-cta {
            font-size: 12px;
            padding: 10px 14px;
          }

          .featured-content h3 {
            font-size: 12px;
          }

          .featured-price {
            font-size: 10px;
          }

          .price-unit {
            font-size: 8px;
          }

          .featured-image {
            height: 100px;
          }
        }
      `}</style>
    </div>
  )
}

export default Home

