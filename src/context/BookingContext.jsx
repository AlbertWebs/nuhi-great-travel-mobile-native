import { createContext, useContext, useState } from 'react'

const BookingContext = createContext()

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider')
  }
  return context
}

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    fleet: null,
    pickupDate: null,
    dropoffDate: null,
    pickupLocation: '',
    dropoffLocation: '',
    customerInfo: {
      fullName: '',
      email: '',
      mobile: '',
    },
    totalPrice: 0,
    days: 0,
  })

  const updateBooking = (data) => {
    setBookingData(prev => ({ ...prev, ...data }))
  }

  const resetBooking = () => {
    setBookingData({
      fleet: null,
      pickupDate: null,
      dropoffDate: null,
      pickupLocation: '',
      dropoffLocation: '',
      customerInfo: {
        fullName: '',
        email: '',
        mobile: '',
      },
      totalPrice: 0,
      days: 0,
    })
  }

  return (
    <BookingContext.Provider value={{ bookingData, updateBooking, resetBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

