# TravelAI React Frontend

A modern React frontend for the TravelAI travel platform, built with TypeScript, Tailwind CSS, and Vite.

## 🚀 Features

- **Modern React 18** with TypeScript
- **Tailwind CSS** for styling with custom design system
- **Zustand** for state management
- **React Query** for server state management
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Responsive Design** with mobile-first approach
- **Component Library** with reusable UI components

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Input, Card)
│   ├── layout/         # Layout components (Header, Footer)
│   ├── forms/          # Form components
│   └── widgets/        # Complex widgets
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/              # Zustand stores
├── types/              # TypeScript types
├── utils/              # Utility functions
└── styles/             # Global styles
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:3000

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 🎨 Design System

The frontend uses a custom design system based on the existing HTML design:

### Colors
- **Primary**: Blue gradient (#2553eb to #4b90e6)
- **Secondary**: Emerald (#10B981)
- **Accent**: Amber (#F59E0B)
- **Gray Scale**: Custom primary scale

### Typography
- **Primary Font**: DM Sans
- **Secondary Font**: Poppins
- **Fallback**: Inter, system-ui

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Cards**: Hover effects and variants
- **Inputs**: Icon support and validation states
- **Layout**: Responsive grid system

## 🔌 API Integration

The frontend connects to the backend API with:

- **Base URL**: http://localhost:3000/api/v1
- **Authentication**: JWT Bearer tokens
- **Services**: Organized by feature (auth, flights, hotels, bookings, AI)
- **Error Handling**: Centralized error management
- **Loading States**: React Query for caching and loading

## 📱 Pages Overview

### Public Pages
- **Home** (`/`) - Hero section with search widget
- **Flights** (`/flights`) - Flight search and booking
- **Hotels** (`/hotels`) - Hotel search and booking  
- **Itineraries** (`/itineraries`) - AI trip planning hub
- **Packages** (`/packages`) - Ready-made travel packages
- **Auth** (`/auth`) - Login and registration

### Protected Pages
- **Dashboard** (`/dashboard`) - User dashboard
- **Booking** (`/booking`) - Booking flow
- **Profile** (`/profile`) - User profile management

## 🏪 State Management

### Stores
- **authStore** - User authentication and profile
- **searchStore** - Search results and filters
- **bookingStore** - Booking flow and user bookings

### Local Storage
- Authentication tokens
- Booking progress
- Search history
- User preferences

## 🧪 Development

### Code Style
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Conventional Commits** for commit messages

### Testing (Planned)
- **Jest** for unit testing
- **React Testing Library** for component testing
- **Cypress** for E2E testing

## 🚀 Deployment

### Build Optimization
- **Vite** for fast builds and HMR
- **Code Splitting** for optimal loading
- **Tree Shaking** for smaller bundles
- **Asset Optimization** for performance

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=TravelAI
```

## 📋 TODO

### Phase 1 - Core Features
- [ ] Complete authentication pages
- [ ] Implement flight search
- [ ] Implement hotel search
- [ ] Build booking flow
- [ ] Create user dashboard

### Phase 2 - Advanced Features  
- [ ] AI itinerary system
- [ ] Package browsing
- [ ] Advanced filters
- [ ] Price alerts
- [ ] Reviews system

### Phase 3 - Polish
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Accessibility improvements
- [ ] Testing suite
- [ ] Documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary and confidential.

---

**Built with ❤️ for TravelAI**