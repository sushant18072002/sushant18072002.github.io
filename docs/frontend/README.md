# Frontend Documentation

## ⚛️ React.js Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router v6
- **Styling**: CSS Modules + Styled Components
- **UI Components**: Custom component library
- **Forms**: React Hook Form + Yup validation
- **Testing**: Jest + React Testing Library
- **Build Tool**: Vite
- **Package Manager**: npm

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── pages/               # Page components
│   ├── auth/           # Authentication pages
│   ├── booking/        # Booking flow pages
│   ├── flights/        # Flight-related pages
│   ├── hotels/         # Hotel-related pages
│   └── itinerary/      # Itinerary pages
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/              # Redux store configuration
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── assets/             # Static assets
```

## 🎨 Design System

### Typography
```css
/* Primary Font: DM Sans */
--font-primary: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;

/* Secondary Font: Poppins */
--font-secondary: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 24px;
--font-size-2xl: 32px;
--font-size-3xl: 48px;
--font-size-4xl: 96px;

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-black: 900;
```

### Color System
```css
/* Primary Colors */
--color-blue-16: #23262F;
--color-azure-61: #3B71FE;
--color-spring-green-55: #58C27D;
--color-orange-70: #FFD166;

/* Neutral Colors */
--color-grey-99: #FCFCFD;
--color-grey-91: #E6E8EC;
--color-blue-73: #B1B5C3;
--color-azure-52: #777E90;

/* Semantic Colors */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-info: #3B82F6;

/* Background Colors */
--color-white-solid: #FFFFFF;
--color-black-solid: #000000;
```

### Spacing System
```css
/* Spacing Scale */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;
--space-40: 160px;
```

## 🧩 Component Architecture

### Component Categories

#### 1. Layout Components
```typescript
// Header Component
interface HeaderProps {
  user?: User;
  onMenuToggle?: () => void;
  transparent?: boolean;
}

// Navigation Component
interface NavigationProps {
  items: NavigationItem[];
  activeItem?: string;
  variant?: 'horizontal' | 'vertical';
}

// Footer Component
interface FooterProps {
  variant?: 'default' | 'minimal';
  showNewsletter?: boolean;
}
```

#### 2. Form Components
```typescript
// Input Component
interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

// Button Component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

// Select Component
interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  error?: string;
}
```

#### 3. Data Display Components
```typescript
// Card Component
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children: ReactNode;
}

// Table Component
interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  pagination?: PaginationConfig;
  sortable?: boolean;
  selectable?: boolean;
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}
```

## 🔄 State Management

### Redux Store Structure
```typescript
interface RootState {
  auth: AuthState;
  user: UserState;
  flights: FlightsState;
  hotels: HotelsState;
  bookings: BookingsState;
  itinerary: ItineraryState;
  ui: UIState;
}

// Auth State
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Flights State
interface FlightsState {
  searchResults: Flight[];
  filters: FlightFilters;
  selectedFlight: Flight | null;
  loading: boolean;
  error: string | null;
}

// UI State
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  modals: ModalState[];
}
```

### RTK Query API Slices
```typescript
// Flights API
export const flightsApi = createApi({
  reducerPath: 'flightsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/flights',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Flight', 'SearchResults'],
  endpoints: (builder) => ({
    searchFlights: builder.query<FlightSearchResponse, FlightSearchParams>({
      query: (params) => ({
        url: '/search',
        params,
      }),
      providesTags: ['SearchResults'],
    }),
    getFlightDetails: builder.query<Flight, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Flight', id }],
    }),
  }),
});
```

## 🎣 Custom Hooks

### Data Fetching Hooks
```typescript
// useFlightSearch Hook
export const useFlightSearch = () => {
  const [searchParams, setSearchParams] = useState<FlightSearchParams>();
  const { data, isLoading, error } = useSearchFlightsQuery(searchParams, {
    skip: !searchParams,
  });

  const searchFlights = useCallback((params: FlightSearchParams) => {
    setSearchParams(params);
  }, []);

  return {
    flights: data?.flights || [],
    isLoading,
    error,
    searchFlights,
  };
};

// useBooking Hook
export const useBooking = () => {
  const [createBooking] = useCreateBookingMutation();
  const dispatch = useAppDispatch();

  const bookFlight = useCallback(async (bookingData: BookingData) => {
    try {
      const result = await createBooking(bookingData).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Booking confirmed successfully!',
      }));
      return result;
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Booking failed. Please try again.',
      }));
      throw error;
    }
  }, [createBooking, dispatch]);

  return { bookFlight };
};
```

### UI Hooks
```typescript
// useModal Hook
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
};

// useLocalStorage Hook
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};
```

## 🧪 Testing Strategy

### Component Testing
```typescript
// Button Component Test
describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
// useFlightSearch Hook Test
describe('useFlightSearch Hook', () => {
  it('should search flights with correct parameters', async () => {
    const { result } = renderHook(() => useFlightSearch(), {
      wrapper: createWrapper(),
    });

    const searchParams = {
      from: 'NYC',
      to: 'LAX',
      departDate: '2024-12-20',
      passengers: 1,
    };

    act(() => {
      result.current.searchFlights(searchParams);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.flights).toBeDefined();
  });
});
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Media Query Mixins */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Responsive Components
```typescript
// useBreakpoint Hook
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<string>('sm');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else setBreakpoint('sm');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

// Responsive Grid Component
interface GridProps {
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  children: ReactNode;
}

export const Grid: React.FC<GridProps> = ({ cols, gap = 4, children }) => {
  const gridCols = {
    sm: cols?.sm || 1,
    md: cols?.md || 2,
    lg: cols?.lg || 3,
    xl: cols?.xl || 4,
  };

  return (
    <div
      className={`
        grid gap-${gap}
        grid-cols-${gridCols.sm}
        md:grid-cols-${gridCols.md}
        lg:grid-cols-${gridCols.lg}
        xl:grid-cols-${gridCols.xl}
      `}
    >
      {children}
    </div>
  );
};
```

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Lazy Loading Pages
const FlightsPage = lazy(() => import('../pages/flights/FlightsPage'));
const HotelsPage = lazy(() => import('../pages/hotels/HotelsPage'));
const ItineraryPage = lazy(() => import('../pages/itinerary/ItineraryPage'));

// Route Configuration
const AppRoutes = () => (
  <Routes>
    <Route path="/flights" element={
      <Suspense fallback={<PageLoader />}>
        <FlightsPage />
      </Suspense>
    } />
    <Route path="/hotels" element={
      <Suspense fallback={<PageLoader />}>
        <HotelsPage />
      </Suspense>
    } />
  </Routes>
);
```

### Memoization
```typescript
// Memoized Components
const FlightCard = React.memo<FlightCardProps>(({ flight, onSelect }) => {
  return (
    <Card onClick={() => onSelect(flight)}>
      <FlightInfo flight={flight} />
      <PriceDisplay price={flight.price} />
    </Card>
  );
});

// Memoized Selectors
const selectFilteredFlights = createSelector(
  [selectAllFlights, selectActiveFilters],
  (flights, filters) => {
    return flights.filter(flight => {
      return (
        (!filters.maxPrice || flight.price <= filters.maxPrice) &&
        (!filters.airlines.length || filters.airlines.includes(flight.airline)) &&
        (!filters.stops || flight.stops <= filters.stops)
      );
    });
  }
);
```

### Bundle Optimization
```typescript
// Vite Configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', 'framer-motion'],
          utils: ['date-fns', 'lodash'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
```