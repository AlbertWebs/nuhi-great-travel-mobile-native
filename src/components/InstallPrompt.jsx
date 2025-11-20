import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaDownload } from 'react-icons/fa'

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false)
      return
    }

    // Check if dismissed in this session
    if (localStorage.getItem('installPromptDismissed') === 'true') {
      setShowPrompt(false)
      return
    }

    // Check if Chrome browser
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
    if (!isChrome) {
      return
    }

    // Listen for the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 2000) // Show after 2 seconds
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Also show prompt if user has been on site for a while (fallback)
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt && !localStorage.getItem('installPromptDismissed')) {
        // Show a manual install prompt
        setShowPrompt(true)
      }
    }, 10000) // Show after 10 seconds if no beforeinstallprompt event

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(fallbackTimer)
    }
  }, [deferredPrompt])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Store dismissal in localStorage to not show again for 7 days
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 7)
    localStorage.setItem('installPromptDismissed', expiry.getTime().toString())
  }

  // Check if prompt was dismissed (with expiry)
  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed')
    if (dismissed) {
      const expiryTime = parseInt(dismissed)
      if (Date.now() < expiryTime) {
        setShowPrompt(false)
      } else {
        // Expired, remove it
        localStorage.removeItem('installPromptDismissed')
      }
    }
  }, [])

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="install-prompt"
        >
          <div className="install-prompt-content">
            <div className="install-prompt-icon">
              <FaDownload size={24} />
            </div>
            <div className="install-prompt-text">
              <h3>Install App</h3>
              <p>Install Nuhi Great Travels for quick access and a better experience</p>
            </div>
            <button
              onClick={handleInstall}
              className="install-btn"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="dismiss-btn"
            >
              <FaTimes />
            </button>
          </div>
        </motion.div>
      )}
      <style jsx>{`
        .install-prompt {
          position: fixed;
          bottom: 80px;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 0 16px;
          pointer-events: none;
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .install-prompt-content {
          background: var(--surface);
          border: 1px solid var(--primary);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.3);
          pointer-events: all;
          max-width: 500px;
          margin: 0 auto;
        }

        .install-prompt-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--black);
          flex-shrink: 0;
        }

        .install-prompt-text {
          flex: 1;
        }

        .install-prompt-text h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }

        .install-prompt-text p {
          font-size: 12px;
          color: var(--text-muted);
        }

        .install-btn {
          background: var(--primary);
          color: var(--black);
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .install-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
        }

        .dismiss-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s ease;
          flex-shrink: 0;
        }

        .dismiss-btn:hover {
          color: var(--text);
        }
      `}</style>
    </AnimatePresence>
  )
}

export default InstallPrompt

