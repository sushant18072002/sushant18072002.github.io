# TravelAI Design System

## Typography
```css
/* Primary Font - DM Sans */
--font-primary: 'DM Sans', sans-serif;
/* Secondary Font - Poppins */
--font-secondary: 'Poppins', sans-serif;

/* Font Sizes */
--text-hero: 96px;
--text-h1: 48px;
--text-h2: 24px;
--text-body: 16px;
--text-small: 14px;
--text-xs: 12px;
```

## Color Palette
```css
/* Primary Colors */
--primary-blue: #3B71FE;
--primary-green: #58C27D;
--primary-amber: #FFD166;

/* Neutral Colors */
--neutral-dark: #23262F;
--neutral-medium: #777E90;
--neutral-light: #E6E8EC;
--neutral-bg: #FCFCFD;

/* Semantic Colors */
--success: #58C27D;
--warning: #FFD166;
--error: #DB593D;
```

## Spacing System
```css
--space-xs: 8px;
--space-sm: 16px;
--space-md: 24px;
--space-lg: 32px;
--space-xl: 48px;
--space-2xl: 64px;
--space-3xl: 80px;
```

## Border Radius
```css
--radius-sm: 8px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-xl: 32px;
--radius-full: 50%;
```

## Component Specifications

### Search Widget (Hero)
- **Size**: Large horizontal layout (1120px max-width)
- **Fields**: Location, Check-in, Check-out, Travelers, Service Type
- **Style**: Glass morphism with backdrop blur
- **CTA**: Prominent blue button with search icon

### Service Cards
- **Layout**: 3-column grid (Flights, Hotels, Trips)
- **Size**: 352px width, responsive
- **Elements**: Icon, title, description, stats badge
- **Hover**: Subtle elevation and scale

### Feature Sections
- **Pattern**: Alternating left/right content with images
- **Typography**: H1 (48px) + subtitle (24px) + body (16px)
- **Spacing**: 136px between major sections

### Navigation
- **Header**: Fixed, glass effect, 88px height
- **Logo**: 106px width brand mark
- **Menu**: Horizontal with dropdowns
- **CTA**: "List Property" secondary button + user avatar