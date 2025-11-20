# Mobile Booking App - Nuhi Great Travels

A beautiful, mobile-friendly Progressive Web App (PWA) for booking car rentals. Built with React, Vite, and Framer Motion for smooth animations and an intuitive user experience.

## Features

- 🚗 Browse vehicles by category (cars listing)
- 🔍 Search and filter vehicles
- 📅 Easy booking flow with multi-step form
- 💳 Real-time price calculation
- 📱 Fully responsive and mobile-optimized
- ⚡ Fast and smooth animations
- 🔄 PWA support for Android installation
- 📦 APK build support with Capacitor
- 🎨 Modern, classy UI design matching main app theme

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- The Laravel backend API running (see main project)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update the API base URL in `.env`:
```
VITE_API_BASE_URL=http://your-laravel-app-url/api/v1
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to any static hosting service.

## API Endpoints

The app expects the following API endpoints:

- `GET /api/v1/cars` - Get all car categories
- `GET /api/v1/fleets` - Get all vehicles (with optional filters)
- `GET /api/v1/fleets/:id` - Get single vehicle details
- `POST /api/v1/calculate-price` - Calculate booking price
- `POST /api/v1/bookings` - Create a new booking
- `GET /api/v1/bookings/:id` - Get booking details

## PWA Installation

### Android

1. Open the app in Chrome browser
2. Tap the menu (three dots)
3. Select "Add to Home screen"
4. The app will be installed as a standalone app

### iOS

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will be installed as a standalone app

## Building APK

See [APK_BUILD_GUIDE.md](./APK_BUILD_GUIDE.md) for detailed instructions on building an Android APK.

Quick start:
```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Then build the APK in Android Studio.

## Project Structure

```
src/
  ├── pages/          # Page components
  ├── context/        # React context (booking state)
  ├── services/       # API service functions
  └── App.jsx         # Main app component
```

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **date-fns** - Date utilities
- **React Icons** - Icon library
- **Vite PWA Plugin** - PWA support

## Development

The app uses:
- Modern React hooks
- Context API for state management
- Framer Motion for smooth animations
- CSS-in-JS (styled-jsx) for styling
- Responsive design principles

## License

Part of the Nuhi Great Travels project.

