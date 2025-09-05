# TravelAI Component Architecture Plan

## Core Components Structure

### 1. Layout Components
```
├── Header/
│   ├── Navigation.jsx
│   ├── Logo.jsx
│   ├── UserMenu.jsx
│   └── LanguageSelector.jsx
├── Footer/
│   ├── Footer.jsx
│   ├── NewsletterSignup.jsx
│   └── SocialLinks.jsx
└── Layout.jsx
```

### 2. Hero Section Components
```
├── Hero/
│   ├── HeroSection.jsx
│   ├── SearchWidget.jsx (PRIORITY - Large Horizontal)
│   │   ├── LocationInput.jsx
│   │   ├── DatePicker.jsx
│   │   ├── TravelerSelector.jsx
│   │   ├── ServiceTabs.jsx (Flights/Hotels/Trips)
│   │   └── SearchButton.jsx
│   └── HeroBackground.jsx
```

### 3. Service-Specific Components
```
├── Flights/
│   ├── FlightSearch.jsx
│   ├── FlightCard.jsx
│   ├── FlightFilters.jsx
│   └── FlightResults.jsx
├── Hotels/
│   ├── HotelSearch.jsx
│   ├── HotelCard.jsx
│   ├── HotelFilters.jsx
│   └── HotelResults.jsx
└── Trips/
│   ├── TripPlanner.jsx
│   ├── AITripGenerator.jsx
│   ├── ItineraryCard.jsx
│   └── TripCustomizer.jsx
```

### 4. Shared UI Components
```
├── UI/
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── Modal.jsx
│   ├── Tabs.jsx
│   ├── Badge.jsx
│   ├── Rating.jsx
│   ├── Carousel.jsx
│   ├── ImageGallery.jsx
│   └── LoadingSpinner.jsx
```

### 5. Feature Sections
```
├── Sections/
│   ├── FeaturedDestinations.jsx
│   ├── HowItWorks.jsx
│   ├── PopularCategories.jsx
│   ├── Testimonials.jsx
│   ├── NearbyPlaces.jsx
│   └── CallToAction.jsx
```

## Page Structure Plan

### Home Page Layout
1. **Header** (Fixed, 88px height)
2. **Hero Section** (776px height)
   - Background image/video
   - Large horizontal search widget (1120px)
   - Primary CTA
3. **Service Categories** (3-column: Flights, Hotels, Trips)
4. **Featured Destinations** (Carousel)
5. **How It Works** (3-step process)
6. **AI Trip Planning** (Feature highlight)
7. **Popular Categories** (Grid layout)
8. **Testimonials** (Social proof)
9. **Newsletter Signup**
10. **Footer**

## Search Widget Specifications (PRIORITY)

### Layout
- **Container**: 1120px max-width, centered
- **Background**: Glass morphism (backdrop-blur-16px)
- **Border**: 1px solid rgba(255,255,255,0.2)
- **Shadow**: 0px 40px 64px -32px rgba(15,15,15,0.1)
- **Padding**: 40px
- **Border Radius**: 24px

### Fields Layout (Horizontal)
```
[Service Tabs: Flights | Hotels | Trips]
[Location Input] [Check-in Date] [Check-out Date] [Travelers] [Search Button]
```

### Field Specifications
1. **Service Tabs**
   - Active: Blue underline + dark text
   - Inactive: Gray text
   - Font: DM Sans 14px bold

2. **Location Input**
   - Width: 300px
   - Icon: Location pin (left)
   - Placeholder: "Where are you going?"
   - Autocomplete: Yes

3. **Date Inputs**
   - Width: 222px each
   - Icon: Calendar (left)
   - Format: "Check in" / "Check out"
   - Default: "Add date"

4. **Travelers**
   - Width: 200px
   - Icon: User (left)
   - Dropdown: Adults, Children, Rooms
   - Default: "Travelers"

5. **Search Button**
   - Size: 64px × 64px
   - Shape: Circle
   - Color: Primary blue (#3B71FE)
   - Icon: Search (white)
   - Position: Right aligned

## Development Priority

### Phase 1 (Week 1-2)
1. ✅ Setup design system (colors, typography, spacing)
2. 🔄 Create basic layout components (Header, Footer)
3. 🔄 Build search widget (horizontal layout)
4. 🔄 Implement service tabs functionality

### Phase 2 (Week 3-4)
1. Hero section with background
2. Service category cards
3. Basic routing for Flights/Hotels/Trips
4. Responsive design implementation

### Phase 3 (Week 5-6)
1. Featured destinations section
2. How it works section
3. AI trip planning integration
4. Search functionality backend

### Phase 4 (Week 7-8)
1. Results pages for each service
2. Booking flow
3. User authentication
4. Testing and optimization

## Technical Implementation Notes

### State Management
- Use React Context for search parameters
- Redux Toolkit for complex state (bookings, user data)
- Local state for UI interactions

### Styling Approach
- Tailwind CSS for utility-first styling
- CSS modules for component-specific styles
- CSS variables for design tokens

### Responsive Breakpoints
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2-column)
- Desktop: > 1024px (multi-column)

### Performance Considerations
- Lazy loading for images
- Code splitting by routes
- Debounced search inputs (300ms)
- Optimized bundle size with tree shaking