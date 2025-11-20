import { NavLink, useLocation } from 'react-router-dom'
import { FaHome, FaCar, FaSearch, FaUser } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const BottomNav = () => {
  const location = useLocation()
  
  // Hide bottom nav on certain pages
  const hideOnPages = ['/booking', '/booking/success', '/login', '/register']
  const shouldHide = hideOnPages.some(path => location.pathname.startsWith(path))
  
  if (shouldHide) return null

  const { isAuthenticated } = useAuth()
  
  const navItems = [
    { path: '/', icon: FaHome, label: 'Home', exact: true },
    { path: '/cars', icon: FaCar, label: 'Cars', exact: false },
    { path: '/fleets', icon: FaSearch, label: 'Browse', exact: false },
    { path: isAuthenticated ? '/profile' : '/login', icon: FaUser, label: 'Account', exact: false },
  ]

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bottom-nav"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        let isActive = false
        if (item.path === '/profile' && location.pathname.startsWith('/profile')) {
          isActive = true
        } else if (item.exact) {
          isActive = location.pathname === item.path
        } else {
          isActive = location.pathname.startsWith(item.path)
        }
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <motion.div
              whileTap={{ scale: 0.85 }}
              className="nav-item-content"
            >
              <div className="nav-icon-wrapper">
                <Icon />
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="active-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
            </motion.div>
          </NavLink>
        )
      })}
      
      <style jsx>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--surface);
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
          z-index: 1000;
          box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.5), 0 -1px 0 rgba(255, 215, 0, 0.1);
          backdrop-filter: blur(10px);
          height: 56px;
        }

        .nav-item {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: var(--text-muted);
          transition: all 0.3s ease;
          padding: 4px;
          position: relative;
          height: 100%;
        }

        .nav-item-content {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100%;
          height: 100%;
        }

        .nav-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .nav-item .nav-icon-wrapper {
          background: transparent;
        }

        .nav-item.active .nav-icon-wrapper {
          background: rgba(255, 215, 0, 0.15);
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
        }

        .nav-item svg {
          font-size: 22px;
          transition: all 0.3s ease;
          position: relative;
          z-index: 2;
        }

        .nav-item.active svg {
          color: var(--primary);
          transform: scale(1.15);
        }

        .active-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 36px;
          height: 36px;
          background: var(--primary);
          border-radius: 10px;
          opacity: 0.2;
          z-index: 1;
        }

        .nav-label {
          display: none;
        }

        /* Active state animation */
        .nav-item.active .nav-icon-wrapper::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0;
          height: 0;
          background: var(--primary);
          border-radius: 50%;
          opacity: 0.2;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            width: 0;
            height: 0;
            opacity: 0.2;
          }
          50% {
            width: 50px;
            height: 50px;
            opacity: 0;
          }
        }

        /* Safe area for devices with notches */
        @supports (padding: max(0px)) {
          .bottom-nav {
            padding-bottom: max(6px, env(safe-area-inset-bottom));
            height: calc(56px + env(safe-area-inset-bottom));
          }
        }

        /* Tablet and larger screens - hide */
        @media (min-width: 768px) {
          .bottom-nav {
            display: none;
          }
        }

        /* Very small screens */
        @media (max-width: 360px) {
          .nav-icon-wrapper {
            width: 40px;
            height: 40px;
          }

          .nav-item svg {
            font-size: 20px;
          }

          .bottom-nav {
            height: 52px;
            padding: 4px 0 calc(4px + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </motion.nav>
  )
}

export default BottomNav

