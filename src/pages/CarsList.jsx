import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCar, FaSearch } from 'react-icons/fa'
import { getCars, getFleets } from '../services/api'

const CarsList = () => {
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [fleets, setFleets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCar, setSelectedCar] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Skip on initial mount (loadData handles that)
    if (cars.length === 0) return

    // Debounce search to avoid too many API calls
    const timer = setTimeout(() => {
      if (selectedCar !== null && selectedCar !== undefined) {
        loadFleetsForCar(selectedCar)
      } else {
        loadAllFleets()
      }
    }, searchTerm && searchTerm.trim() ? 500 : 0) // Only debounce if there's a search term

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCar, searchTerm])

  const loadData = async () => {
    try {
      setLoading(true)
      const carsRes = await getCars()
      console.log('Cars API response:', carsRes)
      
      // The API returns { success: true, data: [...] }
      // getCars() returns response.data which is { success: true, data: [...] }
      // So we need carsRes.data to get the array
      if (carsRes && carsRes.success && carsRes.data) {
        console.log('Setting cars:', carsRes.data)
        setCars(carsRes.data)
      } else if (carsRes && Array.isArray(carsRes)) {
        // Fallback: if response is directly an array
        console.log('Setting cars (direct array):', carsRes)
        setCars(carsRes)
      } else {
        console.error('Invalid cars response structure:', carsRes)
        setCars([])
      }
      
      // Load all fleets without search on initial load
      const fleetsRes = await getFleets({})
      if (fleetsRes && fleetsRes.success && fleetsRes.data) {
        setFleets(fleetsRes.data)
      } else if (fleetsRes && Array.isArray(fleetsRes)) {
        setFleets(fleetsRes)
      } else {
        setFleets([])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setCars([])
      setFleets([])
    } finally {
      setLoading(false)
    }
  }

  const loadAllFleets = async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm.trim()
      }
      const fleetsRes = await getFleets(params)
      setFleets(fleetsRes.data)
    } catch (error) {
      console.error('Error loading fleets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFleetsForCar = async (carId) => {
    try {
      setLoading(true)
      const params = { car_id: carId }
      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm.trim()
      }
      const fleetsRes = await getFleets(params)
      setFleets(fleetsRes.data)
    } catch (error) {
      console.error('Error loading fleets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    if (selectedCar) {
      loadFleetsForCar(selectedCar)
    } else {
      loadAllFleets()
    }
  }

  return (
    <div className="cars-list-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cars-header"
      >
        <button
          onClick={() => navigate(-1)}
          className="back-btn"
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '8px', color: 'rgba(255, 255, 255, 0.8)' }}
        >
          ←
        </button>
        <h1>Available Cars</h1>
        <div style={{ width: '40px' }}></div>
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

      {/* Car Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="categories-section"
      >
        <h2 className="section-title">Categories</h2>
        {cars.length === 0 && !loading && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
            No car categories available
          </p>
        )}
        <div className="categories-grid">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`category-card ${selectedCar === null ? 'active' : ''}`}
            onClick={() => setSelectedCar(null)}
          >
            <FaCar size={32} />
            <span>All Vehicles</span>
          </motion.div>
          {cars && cars.length > 0 ? (
            cars.slice(0, 3).map((car) => (
              <motion.div
                key={car.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`category-card ${selectedCar === car.id ? 'active' : ''}`}
                onClick={() => setSelectedCar(car.id)}
              >
                <FaCar size={32} />
                <span>{car.make}</span>
              </motion.div>
            ))
          ) : (
            !loading && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                Loading categories...
              </div>
            )
          )}
        </div>
      </motion.div>

      {/* Fleets List */}
      {loading ? (
        <div className="fleets-section">
          <h2 className="section-title">
            {selectedCar
              ? `${cars.find((c) => c.id === selectedCar)?.make || 'Category'} Vehicles`
              : 'All Vehicles'}
          </h2>
          <div className="fleets-list">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="fleet-item-skeleton">
                <div className="fleet-item-image-skeleton"></div>
                <div className="fleet-item-content-skeleton">
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
          <p>Try selecting a different category or adjusting your search</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="fleets-section"
        >
          <h2 className="section-title">
            {selectedCar
              ? `${cars.find((c) => c.id === selectedCar)?.make || 'Category'} Vehicles`
              : 'All Vehicles'}
            <span className="count-badge">{fleets.length}</span>
          </h2>
          <div className="fleets-list">
            {fleets.map((fleet, index) => (
              <motion.div
                key={fleet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="fleet-item"
                onClick={() => navigate(`/fleets/${fleet.id}`)}
              >
                {fleet.image && (
                  <div className="fleet-item-image">
                    <img src={fleet.image} alt={fleet.name} />
                  </div>
                )}
                <div className="fleet-item-content">
                  <div className="fleet-item-header">
                    <h3>{fleet.name}</h3>
                    {fleet.car && (
                      <span className="fleet-badge">{fleet.car.make}</span>
                    )}
                  </div>
                  <div className="fleet-item-specs">
                    {fleet.seats && <span>👥 {fleet.seats}</span>}
                    {fleet.transmission && <span>⚙️ {fleet.transmission}</span>}
                    {fleet.fuel_type && <span>⛽ {fleet.fuel_type}</span>}
                  </div>
                  <div className="fleet-item-footer">
                    <div className="fleet-price">
                      <span className="price-amount">KES {typeof fleet.price_per_day === 'number' 
                        ? fleet.price_per_day.toFixed(2) 
                        : parseFloat(fleet.price_per_day || 0).toFixed(2)}</span>
                      <span className="price-unit">/day</span>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <style jsx>{`
        .cars-list-container {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 70px; /* Space for compact bottom nav */
        }

        .cars-header {
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

        .cars-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .cars-header .back-btn {
          color: rgba(255, 255, 255, 0.8) !important;
          transition: color 0.3s ease;
        }

        .cars-header .back-btn:hover {
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

        .categories-section {
          padding: 0 20px 24px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .count-badge {
          background: var(--primary);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }

        .category-card {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 20px 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .category-card:hover {
          border-color: var(--primary);
        }

        .category-card svg {
          color: var(--text-light);
          transition: all 0.3s ease;
        }

        .category-card span {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .category-card.active {
          background: var(--primary);
          border-color: var(--primary);
          box-shadow: var(--shadow-gold);
        }

        .category-card.active svg,
        .category-card.active span {
          color: var(--black);
        }

        .category-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }

        .fleets-section {
          padding: 0 20px;
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
          color: var(--text-light);
        }

        .fleets-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .fleet-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          gap: 16px;
        }

        .fleet-item:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-gold);
        }

        .fleet-item-image {
          width: 140px;
          height: 140px;
          flex-shrink: 0;
          overflow: hidden;
          background: var(--border);
        }

        .fleet-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .fleet-item-content {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .fleet-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .fleet-item-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          flex: 1;
        }

        .fleet-badge {
          background: var(--primary);
          color: var(--black);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          box-shadow: var(--shadow-gold);
        }

        .fleet-item-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 13px;
          color: var(--text-light);
        }

        .fleet-item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .fleet-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .price-amount {
          font-size: 22px;
          font-weight: 700;
          color: var(--primary);
        }

        .price-unit {
          font-size: 12px;
          color: var(--text-light);
        }

        @media (max-width: 768px) {
          .fleet-item {
            flex-direction: column;
          }

          .fleet-item-image {
            width: 100%;
            height: 200px;
          }

          .categories-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
          }

          .category-card {
            padding: 16px 8px;
          }
        }

        /* Loading Skeletons */
        .fleet-item-skeleton {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
          display: flex;
          gap: 16px;
          min-height: 140px;
        }

        .fleet-item-image-skeleton {
          width: 140px;
          height: 140px;
          flex-shrink: 0;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.05) 0%, 
            rgba(255, 215, 0, 0.1) 50%, 
            rgba(255, 255, 255, 0.05) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .fleet-item-content-skeleton {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: space-between;
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
          width: 40%;
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
      `}</style>
    </div>
  )
}

export default CarsList

