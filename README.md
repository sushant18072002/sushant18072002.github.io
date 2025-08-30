# TravelAI - AI-Powered Travel Platform

A modern travel platform that creates perfect trips from your dreams using AI-powered recommendations.

## 🚀 Features

- **AI Trip Planning**: Describe your dream trip and let AI create personalized itineraries
- **Smart Search**: Intelligent location and airport search with autocomplete
- **Responsive Design**: Optimized for all devices from mobile to desktop
- **Real-time Data**: Dynamic content loading from backend APIs
- **Modern UI**: Clean, professional interface with smooth animations

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Vite** for build tooling

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **RESTful APIs** with proper error handling
- **JWT Authentication** (ready for implementation)

## 📦 Project Structure

```
Travel/
├── react-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── config/         # Configuration files
│   │   ├── constants/      # App constants
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
├── backend/                # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── services/       # Business logic
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Travel
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your MongoDB connection in .env
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd react-frontend
   npm install
   cp .env.example .env
   # Configure API base URL in .env
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/travelai
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=TravelAI
VITE_ENVIRONMENT=development
```

## 🔧 Configuration

### API Configuration
The frontend uses a centralized API service located in `src/services/api.service.ts`:

- **Base URL**: Configurable via environment variables
- **Error Handling**: Automatic retry and error management
- **Timeout**: Configurable request timeout
- **Type Safety**: Full TypeScript support

### Constants Management
App-wide constants are managed in `src/constants/app.constants.ts`:

- **Trip Types**: Adventure, Cultural, Relaxation, etc.
- **Budget Ranges**: Budget, Mid-range, Luxury
- **UI Constants**: Animation durations, debounce delays
- **Form Validation**: Min/max values, length limits

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: < 768px (single column layouts)
- **Tablet**: 768px - 1024px (2-column grids)
- **Desktop**: > 1024px (multi-column layouts)

## 🎨 Design System

### Typography
- **Primary Font**: DM Sans (headings, UI elements)
- **Secondary Font**: Poppins (body text, descriptions)

### Colors
- **Primary**: Blue Ocean (#3B71FE)
- **Secondary**: Emerald (#58C27D)
- **Accent**: Amber Premium (#FFD166)
- **Neutral**: Various grays for text and backgrounds

## 🔒 Security Features

- **Input Validation**: All user inputs are validated
- **XSS Protection**: Proper escaping of user content
- **API Security**: Rate limiting and error handling
- **Environment Variables**: Sensitive data in env files

## 🚀 Deployment

### Frontend Deployment
```bash
cd react-frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm run build
# Deploy to your server with PM2 or similar
```

## 📊 Performance Optimizations

- **Debounced Search**: 300ms debounce on search inputs
- **Image Optimization**: Proper fallbacks and lazy loading
- **API Caching**: 5-minute cache for static data
- **Bundle Splitting**: Optimized build with Vite

## 🧪 Testing

```bash
# Frontend tests
cd react-frontend
npm run test

# Backend tests
cd backend
npm run test
```

## 📈 Monitoring

- **Error Tracking**: Console logging with proper error handling
- **Performance**: Optimized API calls and rendering
- **User Experience**: Loading states and error boundaries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

Built with ❤️ using modern web technologies