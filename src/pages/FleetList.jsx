import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaFilter, FaCar } from 'react-icons/fa'
import { getFleets, getCars } from '../services/api'

const FleetList = () => {
  const navigate = useNavigate()
  const [fleets, setFleets] = useState([])
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCar, setSelectedCar] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedCar])

  const loadData = async () => {
    try {
      setLoading(true)
      const [fleetsRes, carsRes] = await Promise.all([
        getFleets({ car_id: selectedCar, search: searchTerm }),
        getCars()
      ])
      setFleets(fleetsRes.data)
      setCars(carsRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadData()
  }

  return (
    <div className="fleet-list-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fleet-header"
      >
        <button
          onClick={() => navigate(-1)}
          className="back-btn"
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '8px', color: 'rgba(255, 255, 255, 0.8)' }}
        >
          ←
        </button>
        <h1>Our Fleet</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="filter-btn"
          style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '8px', color: 'rgba(255, 255, 255, 0.8)' }}
        >
          <FaFilter />
        </button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="search-container"
      >
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="input"
          />
          <button onClick={handleSearch} className="btn btn-primary" style={{ padding: '10px 20px' }}>
            Search
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="filters-panel"
        >
          <div className="filter-group">
            <label>Category</label>
            <div className="filter-chips">
              <button
                className={`filter-chip ${selectedCar === null ? 'active' : ''}`}
                onClick={() => setSelectedCar(null)}
              >
                All
              </button>
              {cars.map((car) => (
                <button
                  key={car.id}
                  className={`filter-chip ${selectedCar === car.id ? 'active' : ''}`}
                  onClick={() => setSelectedCar(car.id)}
                >
                  {car.make}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Fleet Grid */}
      {loading ? (
        <div className="fleets-section">
          <h2 className="section-title">
            {selectedCar
              ? `${cars.find((c) => c.id === selectedCar)?.make || 'Category'} Vehicles`
              : 'All Vehicles'}
          </h2>
          <div className="fleet-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="fleet-card-skeleton">
                <div className="fleet-card-image-skeleton"></div>
                <div className="fleet-card-content-skeleton">
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line specs"></div>
                  <div className="skeleton-line price"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : fleets.length === 0 ? (
        <div className="empty-state">
          <FaCar size={64} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
          <h3>No vehicles found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="fleet-grid">
          {fleets.map((fleet, index) => (
            <motion.div
              key={fleet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="fleet-card"
              onClick={() => navigate(`/fleets/${fleet.id}`)}
            >
              {fleet.image && (
                <div className="fleet-card-image">
                  <img src={fleet.image} alt={fleet.name} />
                  {fleet.car && (
                    <span className="fleet-badge">{fleet.car.make}</span>
                  )}
                </div>
              )}
              <div className="fleet-card-content">
                <h3>{fleet.name}</h3>
                <div className="fleet-specs">
                  {fleet.seats && <span>👥 {fleet.seats} seats</span>}
                  {fleet.transmission && <span>⚙️ {fleet.transmission}</span>}
                  {fleet.fuel_type && <span>⛽ {fleet.fuel_type}</span>}
                </div>
                <div className="fleet-price">
                  <span className="price-amount">KES {typeof fleet.price_per_day === 'number' 
                    ? fleet.price_per_day.toFixed(2) 
                    : parseFloat(fleet.price_per_day || 0).toFixed(2)}</span>
                  <span className="price-unit">/day</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style jsx>{`
        .fleet-list-container {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 70px; /* Space for compact bottom nav */
        }

        .fleet-header {
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

        .fleet-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .fleet-header .back-btn,
        .fleet-header .filter-btn {
          color: rgba(255, 255, 255, 0.8) !important;
          transition: color 0.3s ease;
        }

        .fleet-header .back-btn:hover,
        .fleet-header .filter-btn:hover {
          color: rgba(255, 255, 255, 1) !important;
        }

        .search-container {
          padding: 20px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 12px 16px;
          border-radius: 16px;
          box-shadow: var(--shadow);
        }

        .search-box svg {
          color: var(--text-light);
          font-size: 20px;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 16px;
        }

        .search-box input:focus {
          outline: none;
        }

        .filters-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 20px;
          margin: 0 20px 20px;
          border-radius: 16px;
          box-shadow: var(--shadow);
        }

        .filter-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--text);
        }

        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .filter-chip {
          padding: 8px 16px;
          border: 2px solid var(--border);
          border-radius: 20px;
          background: var(--surface);
          color: var(--text);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-chip.active {
          background: var(--primary);
          color: var(--black);
          border-color: var(--primary);
          box-shadow: var(--shadow-gold);
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

        .loading-container p,
        .empty-state p {
          margin-top: 16px;
          color: var(--text-light);
        }

        .empty-state h3 {
          margin-bottom: 8px;
          color: var(--text);
        }

        .fleet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          padding: 0 20px;
        }

        .fleet-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--shadow);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .fleet-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-gold);
        }

        .fleet-card-image {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: var(--border);
        }

        .fleet-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .fleet-card:hover .fleet-card-image img {
          transform: scale(1.05);
        }

        .fleet-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .fleet-card-content {
          padding: 20px;
        }

        .fleet-card-content h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text);
        }

        .fleet-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 14px;
          color: var(--text-light);
        }

        .fleet-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .price-amount {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
        }

        .price-unit {
          font-size: 14px;
          color: var(--text-light);
        }

        /* Loading Skeletons */
        .fleet-card-skeleton {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
        }

        .fleet-card-image-skeleton {
          width: 100%;
          height: 200px;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 215, 0, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .fleet-card-content-skeleton {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
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
        }

        .skeleton-line.title {
          width: 80%;
          height: 20px;
        }

        .skeleton-line.specs {
          width: 60%;
        }

        .skeleton-line.price {
          width: 50%;
          height: 22px;
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
          .fleet-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .search-box {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default FleetList

