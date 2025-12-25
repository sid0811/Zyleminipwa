# ZyleminiPlus PWA

Progressive Web App version of ZyleminiPlus - Field Sales Management System

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Add API keys, Firebase config, etc.

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── api/              # API calls (adapted from React Native)
├── assets/           # Static assets
├── components/       # Reusable UI components
├── constants/        # App constants (copied from RN)
├── core/            # Core business logic (adapted from RN)
├── database/        # SQLite database (sql.js)
├── hooks/           # Custom React hooks (adapted from RN)
├── i18n/            # Internationalization (copied from RN)
├── navigation/      # React Router setup
├── redux/           # Redux store (copied from RN)
├── screens/         # Screen components (adapted from RN)
├── theme/           # Theme configuration
├── types/           # TypeScript types (copied from RN)
├── utility/         # Utility functions (adapted from RN)
└── App.tsx          # Root component
```

## 🔧 Technology Stack

- **React 19.0.0** - UI Framework
- **TypeScript 5.0.4** - Type Safety
- **Vite** - Build Tool
- **Redux Toolkit** - State Management
- **sql.js** - SQLite in Browser
- **React Router** - Routing
- **Material-UI** - UI Components
- **Firebase** - Push Notifications

## 📝 Environment Variables

See `.env.example` for required environment variables.

## 🗄️ Database

Uses sql.js (SQLite compiled to WebAssembly) with IndexedDB persistence.

## 📱 PWA Features

- Installable
- Offline support
- Push notifications
- Service Worker caching

## 📚 Documentation

- See `PROJECT_SETUP_GUIDE.md` for detailed setup
- See `FINAL_CONVERSION_PLAN_CONFIRMED.md` for conversion plan

## 🔗 Related Repositories

- **Mobile App**: ZyleminiPlus-Mobile (React Native)

## 📄 License

MIT

