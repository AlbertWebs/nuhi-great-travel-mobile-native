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
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="hero-subtitle"
          >
            Experience luxury travel with our premium fleet
          </motion.p>
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
          onClick={() => window.open('https://maps.app.goo.gl/iwzjDPTy84v8hMYg9', '_blank')}
        >
          <div className="action-icon">
            <FaMapMarkerAlt />
          </div>
          <h3>Locations</h3>
          <p>Find us nearby</p>
        </motion.div>
      </motion.div>

      {/* All Vehicles with Infinite Scroll */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="featured-section"
        >
          <h2 className="section-title">Available Vehicles</h2>
          <div className="featured-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="featured-card-skeleton">
                <div className="featured-image-skeleton"></div>
                <div className="featured-content-skeleton">
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-line price"></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : displayedFleets.length > 0 && (
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
                    KES {typeof fleet.price_per_day === 'number' 
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
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          padding: 80px 20px 100px;
          text-align: center;
          color: var(--text);
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
            url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M50 50m-20 0a20 20 0 1 1 40 0a20 20 0 1 1 -40 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 1;
        }

        .hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
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
          max-width: 200px;
          max-height: 90px;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.4));
          display: block;
          transition: all 0.3s ease;
        }

        .hero-logo:hover img {
          filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.6));
          transform: scale(1.02);
        }

        .hero-title {
          font-size: 52px;
          font-weight: 800;
          margin-bottom: 16px;
          line-height: 1.15;
          letter-spacing: -0.5px;
          text-transform: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .gradient-text {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
          font-size: 58px;
          margin-top: 8px;
          font-weight: 900;
          letter-spacing: -1px;
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }

        .hero-subtitle {
          font-size: 18px;
          margin-bottom: 40px;
          opacity: 0.75;
          font-weight: 300;
          letter-spacing: 0.5px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          width: 100%;
          max-width: 100%;
        }

        .hero-cta {
          font-size: 15px;
          padding: 14px 28px;
          gap: 10px;
          flex: 1;
          max-width: 48%;
          min-width: 0;
          font-weight: 600;
          letter-spacing: 0.3px;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
        }

        .hero-cta svg {
          font-size: 16px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          padding: 32px 24px;
          max-width: 700px;
          margin: -50px auto 50px;
          position: relative;
          z-index: 2;
        }

        .action-card {
          background: var(--surface);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 28px 20px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .action-card:hover {
          border-color: rgba(255, 215, 0, 0.4);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.2), 0 0 40px rgba(255, 215, 0, 0.15);
          transform: translateY(-4px);
        }

        .action-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          color: var(--black);
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .action-card:hover .action-icon {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .action-card h3 {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--text);
          letter-spacing: 0.2px;
        }

        .action-card p {
          font-size: 13px;
          color: var(--text-muted);
          opacity: 0.8;
          line-height: 1.4;
        }

        .featured-section {
          padding: 0 20px;
          margin-top: 40px;
        }

        .section-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 32px;
          color: var(--text);
          text-align: center;
          letter-spacing: -0.5px;
          position: relative;
          padding-bottom: 16px;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--primary), transparent);
          border-radius: 2px;
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
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }

        .featured-card:hover {
          border-color: rgba(255, 215, 0, 0.4);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.2), 0 0 40px rgba(255, 215, 0, 0.1);
          transform: translateY(-4px);
        }

        .featured-card:active {
          transform: translateY(0);
        }

        .featured-image {
          width: 100%;
          height: 160px;
          overflow: hidden;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          position: relative;
        }

        .featured-image::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, transparent 100%);
          z-index: 1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .featured-card:hover .featured-image::before {
          opacity: 1;
        }

        .featured-image::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40px;
          background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
          z-index: 1;
        }

        .featured-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .featured-card:hover .featured-image img {
          transform: scale(1.08);
        }


        .featured-content {
          padding: 16px;
          background: linear-gradient(to bottom, var(--surface), rgba(255, 255, 255, 0.02));
        }

        .featured-content h3 {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 10px;
          color: var(--text);
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          letter-spacing: 0.1px;
        }

        .featured-price {
          font-size: 18px;
          font-weight: 800;
          color: var(--primary);
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-top: 4px;
        }

        .price-unit {
          font-size: 11px;
          font-weight: 600;
          opacity: 0.7;
          letter-spacing: 0.5px;
        }

        /* Loading Skeletons */
        .featured-card-skeleton {
          background: var(--surface);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
        }

        .featured-image-skeleton {
          width: 100%;
          height: 160px;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 215, 0, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .featured-content-skeleton {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .skeleton-line {
          height: 14px;
          border-radius: 8px;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 215, 0, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-line.short {
          width: 70%;
        }

        .skeleton-line.price {
          width: 50%;
          height: 18px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 60px 20px 80px;
          }

          .hero-title {
            font-size: 38px;
          }

          .gradient-text {
            font-size: 44px;
          }

          .hero-subtitle {
            font-size: 16px;
            margin-bottom: 32px;
          }

          .hero-logo img {
            max-width: 160px;
            max-height: 70px;
          }

          .hero-cta {
            font-size: 14px;
            padding: 12px 24px;
          }

          .quick-actions {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            padding: 28px 20px;
            margin: -45px auto 45px;
          }

          .action-card {
            padding: 24px 16px;
          }

          .action-icon {
            width: 56px;
            height: 56px;
            font-size: 22px;
            margin-bottom: 14px;
          }

          .action-card h3 {
            font-size: 14px;
          }

          .action-card p {
            font-size: 12px;
          }

          .section-title {
            font-size: 24px;
            margin-bottom: 28px;
          }

          .featured-content h3 {
            font-size: 14px;
          }

          .featured-price {
            font-size: 16px;
          }

          .price-unit {
            font-size: 10px;
          }

          .featured-image {
            height: 140px;
          }
        }

        @media (max-width: 360px) {
          .hero-section {
            padding: 50px 16px 70px;
          }

          .hero-title {
            font-size: 32px;
          }

          .gradient-text {
            font-size: 38px;
          }

          .hero-subtitle {
            font-size: 14px;
            margin-bottom: 28px;
          }

          .hero-cta {
            font-size: 13px;
            padding: 11px 20px;
          }

          .quick-actions {
            gap: 12px;
            padding: 24px 16px;
          }

          .action-card {
            padding: 20px 12px;
          }

          .action-icon {
            width: 52px;
            height: 52px;
            font-size: 20px;
          }

          .section-title {
            font-size: 22px;
          }

          .featured-content h3 {
            font-size: 13px;
          }

          .featured-price {
            font-size: 15px;
          }

          .price-unit {
            font-size: 9px;
          }

          .featured-image {
            height: 130px;
          }
        }
      `}</style>
    </div>
  )
}

export default Home

