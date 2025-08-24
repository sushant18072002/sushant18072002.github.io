# 🎨 React Component Mapping from HTML Pages

## 📊 **Component Analysis Overview**
This document maps existing HTML pages to React components, ensuring design consistency while leveraging modern React patterns.

---

## 🏠 **Home Page Components** (`index.html`)

### **Main Sections:**
```tsx
// App.tsx
<HomePage>
  <Navigation />
  <HeroSection />
  <AdventureCategories />
  <FeaturedDestinations />
  <PlanningOptions />
  <FeaturedPackages />
  <HowItWorks />
  <TrustSignals />
  <SocialProof />
  <TravelBlog />
  <Footer />
</HomePage>
```

### **Component Breakdown:**

#### **1. Navigation Component**
```tsx
interface NavigationProps {
  user?: User;
  onAuthClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onAuthClick }) => {
  return (
    <nav className="nav-container">
      <div className="navbar">
        <Logo />
        <NavLinks />
        <AuthButton user={user} onClick={onAuthClick} />
        <MobileMenuToggle />
      </div>
    </nav>
  );
};
```

#### **2. Hero Section with Search Widget**
```tsx
interface HeroSectionProps {
  onSearch: (params: SearchParams) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  return (
    <section className="hero">
      <HeroBackground />
      <HeroOverlay />
      <div className="hero-content">
        <HeroText />
        <SearchWidget onSearch={onSearch} />
      </div>
    </section>
  );
};

// Sub-components
const SearchWidget: React.FC<SearchWidgetProps> = ({ onSearch }) => {
  const [activeTab, setActiveTab] = useState('itinerary');
  
  return (
    <div className="search-widget">
      <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <SearchContent activeTab={activeTab} onSearch={onSearch} />
    </div>
  );
};
```

#### **3. Adventure Categories**
```tsx
const AdventureCategories: React.FC = () => {
  const adventures = [
    { id: 'luxury', icon: '🏖️', title: 'Luxury resort at the sea', count: '9,326 places' },
    { id: 'camping', icon: '🏕️', title: 'Camping amidst the wild', count: '12,326 places' },
    { id: 'mountain', icon: '🏔️', title: 'Mountain house', count: '8,945 places' }
  ];

  return (
    <section className="adventure-section">
      <SectionHeader 
        title="Let's go on an adventure"
        subtitle="Find and book a great experience."
      />
      <div className="adventure-grid">
        {adventures.map(adventure => (
          <AdventureCard 
            key={adventure.id}
            {...adventure}
            onClick={() => selectAdventure(adventure.id)}
          />
        ))}
      </div>
    </section>
  );
};
```

#### **4. Featured Destinations Slider**
```tsx
const FeaturedDestinations: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const destinations = useFeaturedDestinations();

  return (
    <section className="destinations-section">
      <SectionHeader title="Explore mountains in New Zealand" />
      <div className="destinations-slider">
        <DestinationSlider 
          destinations={destinations}
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
        />
        <SliderControls 
          onPrev={() => slideDestinations('prev')}
          onNext={() => slideDestinations('next')}
        />
      </div>
    </section>
  );
};
```

#### **5. Planning Options Cards**
```tsx
const PlanningOptions: React.FC = () => {
  const planningOptions = [
    {
      id: 'ai-dream',
      badge: '⚡ Most Popular',
      icon: '🧠',
      title: 'AI Dream Builder',
      description: 'Describe your dream trip and watch AI create magic',
      features: ['✨ Natural language input', '⚡ Ready in 2 minutes'],
      href: '/itinerary-ai',
      featured: true
    },
    // ... other options
  ];

  return (
    <section className="planning-section">
      <SectionHeader 
        title="How do you want to plan your trip?"
        subtitle="Choose the perfect way to create your dream journey"
      />
      <div className="planning-grid">
        {planningOptions.map(option => (
          <PlanningCard 
            key={option.id}
            {...option}
            onClick={() => navigate(option.href)}
          />
        ))}
      </div>
    </section>
  );
};
```

---

## ✈️ **Flight Page Components** (`flights.html`)

### **Main Structure:**
```tsx
<FlightPage>
  <Navigation />
  <FlightHero />
  <PopularDestinations />
  <FlightResults />
  <WhyChooseUs />
  <FlightPackages />
  <ReadyItineraries />
  <TravelTips />
  <Footer />
</FlightPage>
```

### **Component Breakdown:**

#### **1. Flight Search Hero**
```tsx
const FlightHero: React.FC = () => {
  return (
    <section className="flight-hero">
      <div className="container">
        <HeroContent />
        <FlightSearchForm />
      </div>
    </section>
  );
};

const FlightSearchForm: React.FC = () => {
  const [tripType, setTripType] = useState('roundtrip');
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({});

  return (
    <div className="search-form-container">
      <div className="search-form">
        <TripTypeSelector 
          selected={tripType}
          onChange={setTripType}
        />
        <SearchInputs 
          tripType={tripType}
          params={searchParams}
          onChange={setSearchParams}
        />
        <SearchButton 
          onClick={() => searchFlights(searchParams)}
        />
      </div>
    </div>
  );
};
```

#### **2. Flight Results with Filters**
```tsx
const FlightResults: React.FC = () => {
  const { flights, loading, filters } = useFlightSearch();
  const [selectedFilters, setSelectedFilters] = useState<FlightFilters>({});

  return (
    <section className="flight-results">
      <div className="container">
        <ResultsHeader />
        <FiltersBar />
        <div className="results-layout">
          <FiltersSidebar 
            filters={filters}
            selected={selectedFilters}
            onChange={setSelectedFilters}
          />
          <FlightsList 
            flights={flights}
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
};

const FlightCard: React.FC<FlightCardProps> = ({ flight, onSelect, onCompare }) => {
  return (
    <div className="flight-card">
      <FlightRoute flight={flight} />
      <FlightTiming flight={flight} />
      <FlightPricing flight={flight} />
      <FlightActions 
        onSelect={() => onSelect(flight)}
        onCompare={() => onCompare(flight)}
      />
    </div>
  );
};
```

---

## 🏨 **Hotel Page Components** (`hotels.html`)

### **Main Structure:**
```tsx
<HotelPage>
  <Navigation />
  <HotelHeader />
  <HotelResults />
  <PopularDestinations />
  <WhyChooseUs />
  <Footer />
</HotelPage>
```

### **Component Breakdown:**

#### **1. Hotel Search Header**
```tsx
const HotelHeader: React.FC = () => {
  return (
    <section className="hotel-header">
      <div className="container">
        <HeaderContent />
        <CompactSearchBar />
      </div>
    </section>
  );
};

const CompactSearchBar: React.FC = () => {
  const [searchParams, setSearchParams] = useState<HotelSearchParams>({});

  return (
    <div className="search-bar">
      <div className="search-inputs">
        <LocationInput 
          value={searchParams.location}
          onChange={(location) => setSearchParams({...searchParams, location})}
        />
        <DateInput 
          label="Check in"
          value={searchParams.checkIn}
          onChange={(checkIn) => setSearchParams({...searchParams, checkIn})}
        />
        <DateInput 
          label="Check out"
          value={searchParams.checkOut}
          onChange={(checkOut) => setSearchParams({...searchParams, checkOut})}
        />
        <GuestSelector 
          value={searchParams.guests}
          onChange={(guests) => setSearchParams({...searchParams, guests})}
        />
        <SearchButton onClick={() => searchHotels(searchParams)} />
      </div>
    </div>
  );
};
```

#### **2. Hotel Results Grid**
```tsx
const HotelResults: React.FC = () => {
  const { hotels, loading, filters } = useHotelSearch();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <section className="hotel-results">
      <div className="container">
        <ResultsHeader />
        <FiltersBar />
        <div className="results-layout">
          <HotelFilters />
          <HotelsGrid 
            hotels={hotels}
            viewMode={viewMode}
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
};

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onSelect, onFavorite }) => {
  return (
    <div className="hotel-card">
      <HotelImage hotel={hotel} />
      <HotelInfo hotel={hotel} />
      <HotelPricing hotel={hotel} />
      <HotelActions 
        onSelect={() => onSelect(hotel)}
        onFavorite={() => onFavorite(hotel)}
      />
    </div>
  );
};
```

---

## 🤖 **AI Itinerary Components** (`itinerary-ai.html`)

### **Main Structure:**
```tsx
<AIItineraryPage>
  <Navigation />
  <AIHero />
  <TripGenerator />
  <ItineraryDisplay />
  <CustomizationTools />
  <ShareOptions />
  <Footer />
</AIItineraryPage>
```

### **Component Breakdown:**

#### **1. AI Trip Generator**
```tsx
const TripGenerator: React.FC = () => {
  const [tripDescription, setTripDescription] = useState('');
  const [preferences, setPreferences] = useState<TripPreferences>({});
  const { generateTrip, loading } = useAITripGeneration();

  return (
    <section className="trip-generator">
      <div className="container">
        <GeneratorHeader />
        <TripDescriptionInput 
          value={tripDescription}
          onChange={setTripDescription}
          placeholder="Describe your dream trip..."
        />
        <PreferencesSelector 
          preferences={preferences}
          onChange={setPreferences}
        />
        <GenerateButton 
          onClick={() => generateTrip(tripDescription, preferences)}
          loading={loading}
        />
      </div>
    </section>
  );
};
```

#### **2. Itinerary Display**
```tsx
const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
  return (
    <section className="itinerary-display">
      <ItineraryHeader itinerary={itinerary} />
      <ItineraryTimeline itinerary={itinerary} />
      <ItinerarySummary itinerary={itinerary} />
    </section>
  );
};

const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ itinerary }) => {
  return (
    <div className="itinerary-timeline">
      {itinerary.days.map((day, index) => (
        <DayCard 
          key={index}
          day={day}
          dayNumber={index + 1}
        />
      ))}
    </div>
  );
};

const DayCard: React.FC<DayCardProps> = ({ day, dayNumber }) => {
  return (
    <div className="day-card">
      <DayHeader day={day} dayNumber={dayNumber} />
      <ActivityList activities={day.activities} />
      <DayBudget cost={day.estimatedCost} />
    </div>
  );
};
```

---

## 📋 **Booking Components** (`booking.html`)

### **Main Structure:**
```tsx
<BookingPage>
  <Navigation />
  <BookingProgress />
  <BookingForm />
  <BookingSummary />
  <PaymentSection />
  <Footer />
</BookingPage>
```

### **Component Breakdown:**

#### **1. Multi-Step Booking Form**
```tsx
const BookingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});

  const steps = [
    { id: 1, title: 'Trip Details', component: TripDetailsStep },
    { id: 2, title: 'Traveler Info', component: TravelerInfoStep },
    { id: 3, title: 'Payment', component: PaymentStep },
    { id: 4, title: 'Confirmation', component: ConfirmationStep }
  ];

  return (
    <div className="booking-form">
      <BookingProgress 
        steps={steps}
        currentStep={currentStep}
      />
      <StepContent 
        step={steps.find(s => s.id === currentStep)}
        data={bookingData}
        onChange={setBookingData}
        onNext={() => setCurrentStep(currentStep + 1)}
        onPrev={() => setCurrentStep(currentStep - 1)}
      />
    </div>
  );
};
```

#### **2. Booking Summary Sidebar**
```tsx
const BookingSummary: React.FC<BookingSummaryProps> = ({ booking }) => {
  return (
    <div className="booking-summary">
      <SummaryHeader />
      <BookingDetails booking={booking} />
      <PriceBreakdown pricing={booking.pricing} />
      <TotalPrice total={booking.pricing.totalAmount} />
      <BookingActions />
    </div>
  );
};
```

---

## 👤 **Dashboard Components** (`dashboard.html`)

### **Main Structure:**
```tsx
<DashboardPage>
  <Navigation />
  <DashboardHeader />
  <DashboardStats />
  <UpcomingTrips />
  <BookingHistory />
  <QuickActions />
  <Footer />
</DashboardPage>
```

### **Component Breakdown:**

#### **1. Dashboard Overview**
```tsx
const DashboardStats: React.FC = () => {
  const { stats, loading } = useDashboardStats();

  return (
    <section className="dashboard-stats">
      <div className="stats-grid">
        <StatCard 
          title="Total Trips"
          value={stats.totalTrips}
          icon="✈️"
          trend={stats.tripsTrend}
        />
        <StatCard 
          title="Total Spent"
          value={formatCurrency(stats.totalSpent)}
          icon="💰"
          trend={stats.spentTrend}
        />
        <StatCard 
          title="Loyalty Points"
          value={stats.loyaltyPoints}
          icon="⭐"
          trend={stats.pointsTrend}
        />
        <StatCard 
          title="Saved Amount"
          value={formatCurrency(stats.savedAmount)}
          icon="🎯"
          trend={stats.savedTrend}
        />
      </div>
    </section>
  );
};
```

#### **2. Upcoming Trips**
```tsx
const UpcomingTrips: React.FC = () => {
  const { upcomingTrips, loading } = useUpcomingTrips();

  return (
    <section className="upcoming-trips">
      <SectionHeader title="Upcoming Trips" />
      <div className="trips-grid">
        {upcomingTrips.map(trip => (
          <TripCard 
            key={trip.id}
            trip={trip}
            onViewDetails={() => viewTripDetails(trip.id)}
            onModify={() => modifyTrip(trip.id)}
          />
        ))}
      </div>
    </section>
  );
};
```

---

## 🎨 **Reusable UI Components**

### **1. Base Components**
```tsx
// Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// Input Component
interface InputProps {
  type: 'text' | 'email' | 'password' | 'date' | 'number';
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

// Card Component
interface CardProps {
  variant: 'default' | 'elevated' | 'outlined';
  padding: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### **2. Layout Components**
```tsx
// Section Header
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="section-header">
      <div className="header-content">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="header-action">{action}</div>}
    </div>
  );
};

// Container
const Container: React.FC<ContainerProps> = ({ size = 'default', children }) => {
  return (
    <div className={`container container-${size}`}>
      {children}
    </div>
  );
};
```

### **3. Form Components**
```tsx
// Search Input with Suggestions
const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  onSelect,
  placeholder,
  suggestions 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="search-input-container">
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <SuggestionsList 
          suggestions={suggestions}
          onSelect={onSelect}
        />
      )}
    </div>
  );
};

// Date Range Picker
const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate
}) => {
  return (
    <div className="date-range-picker">
      <DateInput 
        label="Check in"
        value={startDate}
        onChange={(date) => onChange({ startDate: date, endDate })}
        minDate={minDate}
        maxDate={maxDate}
      />
      <DateInput 
        label="Check out"
        value={endDate}
        onChange={(date) => onChange({ startDate, endDate: date })}
        minDate={startDate}
        maxDate={maxDate}
      />
    </div>
  );
};
```

---

## 📱 **Responsive Design Components**

### **1. Mobile Navigation**
```tsx
const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <MobileMenuButton 
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      <MobileMenu 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
```

### **2. Responsive Grid**
```tsx
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  columns = { sm: 1, md: 2, lg: 3, xl: 4 } 
}) => {
  const gridClass = `grid grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl}`;
  
  return (
    <div className={gridClass}>
      {children}
    </div>
  );
};
```

---

## 🎯 **Component Integration Strategy**

### **1. State Management Integration**
```tsx
// Using Zustand for global state
const useSearchStore = create<SearchState>((set, get) => ({
  flights: [],
  hotels: [],
  filters: {},
  loading: false,
  searchFlights: async (params) => {
    set({ loading: true });
    try {
      const flights = await flightService.search(params);
      set({ flights, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  }
}));
```

### **2. API Integration**
```tsx
// Custom hooks for API calls
const useFlightSearch = (params: FlightSearchParams) => {
  return useQuery({
    queryKey: ['flights', params],
    queryFn: () => flightService.search(params),
    enabled: !!params.from && !!params.to
  });
};
```

### **3. Component Composition**
```tsx
// Higher-order components for common functionality
const withLoading = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P & { loading?: boolean }) => {
    if (props.loading) {
      return <LoadingSpinner />;
    }
    return <Component {...props} />;
  };
};
```

---

## 🎨 **Styling Strategy**

### **1. Tailwind CSS Classes**
```tsx
// Consistent styling patterns
const cardStyles = "bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200";
const buttonStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg"
};
```

### **2. CSS-in-JS for Dynamic Styles**
```tsx
const dynamicStyles = {
  card: (featured: boolean) => `
    ${cardStyles}
    ${featured ? 'ring-2 ring-blue-500' : ''}
  `
};
```

---

## 🚀 **Performance Optimization**

### **1. Code Splitting**
```tsx
// Lazy loading for route components
const FlightPage = lazy(() => import('./pages/FlightPage'));
const HotelPage = lazy(() => import('./pages/HotelPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
```

### **2. Memoization**
```tsx
// Memoized components for performance
const FlightCard = memo(({ flight, onSelect }: FlightCardProps) => {
  return (
    <div className="flight-card">
      {/* Component content */}
    </div>
  );
});
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Base Components**
- [ ] Button, Input, Card components
- [ ] Layout components (Container, Grid)
- [ ] Navigation components
- [ ] Form components

### **Phase 2: Page Components**
- [ ] Home page components
- [ ] Flight search components
- [ ] Hotel search components
- [ ] Booking components

### **Phase 3: Advanced Components**
- [ ] AI itinerary components
- [ ] Dashboard components
- [ ] Admin components
- [ ] Mobile components

### **Phase 4: Integration**
- [ ] State management integration
- [ ] API integration
- [ ] Responsive design
- [ ] Performance optimization

---

## 🎉 **Summary**

This component mapping provides a comprehensive blueprint for converting the existing HTML design into a modern React application while maintaining design consistency and improving functionality. The modular approach ensures maintainability, reusability, and scalability.

**Key Benefits:**
- **Design Consistency:** Exact match with existing HTML design
- **Component Reusability:** Modular components for efficiency
- **Type Safety:** Full TypeScript integration
- **Performance:** Optimized rendering and loading
- **Maintainability:** Clean, organized code structure

**🚀 Ready to build a beautiful, functional React frontend that users will love!**