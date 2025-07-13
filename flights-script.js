// Flight Search Page JavaScript
console.log('Flight script loaded');

// Search flights function - defined globally
function searchFlights() {
    console.log('Search button clicked');
    
    const fromCity = document.getElementById('fromCity').value;
    const toCity = document.getElementById('toCity').value;
    const departDate = document.getElementById('departDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const travelers = document.getElementById('travelers').value;
    
    console.log('Form values:', { fromCity, toCity, departDate, returnDate, travelers });
    
    // Basic validation
    if (!fromCity.trim()) {
        alert('Please enter departure city');
        return;
    }
    
    if (!toCity.trim()) {
        alert('Please enter destination city');
        return;
    }
    
    // Show loading
    const searchBtn = document.querySelector('.search-btn');
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<span>⏳</span><span>Searching...</span>';
    searchBtn.disabled = true;
    
    // Show results after delay
    setTimeout(() => {
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
        showFlightResults(fromCity, toCity, departDate, returnDate, travelers);
        
        // Hide other sections and show results prominently
        document.querySelector('.popular-destinations').style.display = 'none';
        document.querySelector('.flight-packages').style.display = 'none';
        document.querySelector('.ready-itineraries').style.display = 'none';
        document.querySelector('.why-choose-us').style.display = 'none';
        document.querySelector('.travel-tips').style.display = 'none';
        
        // Show load more section
        setTimeout(() => {
            const loadMore = document.getElementById('loadMoreSection');
            if (loadMore) loadMore.style.display = 'block';
        }, 200);
        
        // Scroll to results immediately
        setTimeout(() => {
            document.getElementById('flightResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, 1500);
}

// Show flight results
function showFlightResults(from, to, depart, returnDate, travelers) {
    console.log('Showing flight results');
    
    const resultsSection = document.getElementById('flightResults');
    const resultsList = document.getElementById('flightsList');
    
    if (!resultsSection || !resultsList) {
        console.error('Results elements not found');
        return;
    }
    
    // Update results header
    const routeTitle = document.getElementById('routeTitle');
    const searchSummary = document.getElementById('searchSummary');
    const resultsCount = document.getElementById('resultsCount');
    
    if (routeTitle) {
        routeTitle.textContent = `${from.split('(')[0].trim()} → ${to.split('(')[0].trim()}`;
    }
    
    if (searchSummary) {
        const departFormatted = depart ? formatDate(depart) : 'Flexible dates';
        const returnFormatted = returnDate ? '- ' + formatDate(returnDate) : '';
        const tripType = returnDate ? 'Round-trip' : 'One-way';
        searchSummary.textContent = `${departFormatted} ${returnFormatted} • ${travelers} • ${tripType}`;
    }
    
    if (resultsCount) {
        resultsCount.textContent = 'Found 5 flights';
    }
    
    // Generate sample flight results
    const flights = generateSampleFlights(from, to, depart, returnDate);
    
    resultsList.innerHTML = flights.map(flight => `
        <div class="flight-card" onclick="selectFlight('${flight.id}')">
            <div class="flight-main">
                <div class="airline-section">
                    <img src="${flight.airlineImage}" alt="${flight.airline}" class="airline-logo">
                    <div class="airline-info">
                        <h4>${flight.airline}</h4>
                        <span class="flight-number">${flight.flightNumber}</span>
                        <div class="rating">
                            <span class="stars">${'★'.repeat(Math.floor(flight.rating))}${'☆'.repeat(5-Math.floor(flight.rating))}</span>
                            <span class="rating-score">${flight.rating}</span>
                        </div>
                    </div>
                </div>
                
                <div class="flight-route">
                    <div class="departure">
                        <div class="time">${flight.departTime}</div>
                        <div class="airport">${flight.departAirport}</div>
                    </div>
                    
                    <div class="flight-path">
                        <div class="duration">${flight.duration}</div>
                        <div class="route-line">
                            <div class="line"></div>
                            <div class="plane">✈️</div>
                        </div>
                        <div class="stops">${flight.stops}</div>
                    </div>
                    
                    <div class="arrival">
                        <div class="time">${flight.arriveTime}</div>
                        <div class="airport">${flight.arriveAirport}</div>
                    </div>
                </div>
                
                <div class="flight-pricing">
                    ${flight.originalPrice ? `<div class="original-price">$${flight.originalPrice}</div>` : ''}
                    <div class="current-price">$${flight.price}</div>
                    <div class="price-label">per person</div>
                    <div class="pricing-actions">
                        <button class="select-btn" onclick="event.stopPropagation(); selectFlight('${flight.id}')">
                            View Details
                        </button>
                        <button class="alert-btn" onclick="event.stopPropagation(); setPriceAlert('${flight.id}')" title="Get price alerts">
                            🔔
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="flight-details-row">
                <div class="detail-item">
                    <span class="detail-icon">🧳</span>
                    <span>${flight.baggage}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">🔄</span>
                    <span>${flight.cancellation}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">🌱</span>
                    <span>${flight.co2} CO₂</span>
                </div>
                <div class="flight-features">
                    ${flight.features.slice(0, 3).map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('Flight results HTML generated, showing section');
    resultsSection.style.display = 'block';
}

// Generate sample flight data
function generateSampleFlights(from, to, depart, returnDate) {
    const airlines = [
        { name: 'Delta Airlines', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=40&h=40&fit=crop', code: 'DL' },
        { name: 'American Airlines', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=40&h=40&fit=crop', code: 'AA' },
        { name: 'United Airlines', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=40&h=40&fit=crop', code: 'UA' },
        { name: 'Air France', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=40&h=40&fit=crop', code: 'AF' }
    ];
    
    // Extract airport codes safely
    const fromCode = from.match(/\(([^)]+)\)/)?.[1] || 'NYC';
    const toCode = to.match(/\(([^)]+)\)/)?.[1] || 'CDG';
    
    return [
        {
            id: 'flight1',
            airline: airlines[0].name,
            airlineImage: airlines[0].image,
            flightNumber: `${airlines[0].code}1234`,
            price: 599,
            originalPrice: 699,
            departTime: '8:30 AM',
            arriveTime: '2:45 PM',
            departAirport: fromCode,
            arriveAirport: toCode,
            duration: '7h 15m',
            stops: 'Nonstop',
            features: ['Free WiFi', 'Meal Included', 'Extra Legroom'],
            baggage: '1 carry-on, 1 checked bag',
            cancellation: 'Free cancellation',
            rating: 4.2,
            co2: '1.2 tons'
        },
        {
            id: 'flight2',
            airline: airlines[1].name,
            airlineImage: airlines[1].image,
            flightNumber: `${airlines[1].code}5678`,
            price: 549,
            originalPrice: 649,
            departTime: '11:20 AM',
            arriveTime: '6:35 PM',
            departAirport: fromCode,
            arriveAirport: toCode,
            duration: '8h 15m',
            stops: '1 Stop in London',
            features: ['Free WiFi', 'Entertainment'],
            baggage: '1 carry-on, 1 checked bag',
            cancellation: 'Free cancellation',
            rating: 4.0,
            co2: '1.4 tons'
        },
        {
            id: 'flight3',
            airline: airlines[2].name,
            airlineImage: airlines[2].image,
            flightNumber: `${airlines[2].code}9012`,
            price: 649,
            originalPrice: 749,
            departTime: '6:15 PM',
            arriveTime: '12:30 PM+1',
            departAirport: fromCode,
            arriveAirport: toCode,
            duration: '7h 15m',
            stops: 'Nonstop',
            features: ['Premium Economy', 'Priority Boarding', 'Free WiFi'],
            baggage: '2 carry-ons, 2 checked bags',
            cancellation: 'Free cancellation',
            rating: 4.5,
            co2: '1.1 tons'
        }
    ];
}

// Other functions
function setTripType(type) {
    document.querySelectorAll('.trip-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const returnDateGroup = document.getElementById('returnDateGroup');
    if (type === 'oneway' || type === 'multi') {
        returnDateGroup.style.display = 'none';
    } else {
        returnDateGroup.style.display = 'flex';
    }
}

function swapCities() {
    const fromCity = document.getElementById('fromCity');
    const toCity = document.getElementById('toCity');
    
    const temp = fromCity.value;
    fromCity.value = toCity.value;
    toCity.value = temp;
}

function selectDestination(destination) {
    const destinations = {
        'paris': 'Paris, France (CDG)',
        'tokyo': 'Tokyo, Japan (NRT)',
        'london': 'London, UK (LHR)',
        'bali': 'Bali, Indonesia (DPS)'
    };
    
    document.getElementById('toCity').value = destinations[destination];
    document.querySelector('.search-form').scrollIntoView({ behavior: 'smooth' });
}

function selectFlight(flightId) {
    // Navigate to flight details page
    window.location.href = `flight-details.html?flight=${flightId}`;
}

function setPriceAlert(flightId) {
    alert(`🔔 Price Alert Set!\n\nWe'll notify you when prices drop for this flight.\n\nFlight: ${flightId}`);
}

function loadMoreFlights() {
    alert('Loading more flights...\n\nIn a real implementation, this would load additional flight results from the server.');
}

function filterFlights(filterType) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    console.log(`Filtering by: ${filterType}`);
}

function setView(viewType) {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const flightsList = document.getElementById('flightsList');
    const resultsLayout = document.querySelector('.results-layout');
    
    if (viewType === 'grid') {
        // Grid view - hide sidebar, show cards in grid
        resultsLayout.style.gridTemplateColumns = '1fr';
        document.querySelector('.filters-sidebar').style.display = 'none';
        flightsList.style.display = 'grid';
        flightsList.style.gridTemplateColumns = 'repeat(auto-fit, minmax(450px, 1fr))';
        flightsList.style.gap = '20px';
    } else {
        // List view - show sidebar, list layout
        resultsLayout.style.gridTemplateColumns = '280px 1fr';
        document.querySelector('.filters-sidebar').style.display = 'block';
        flightsList.style.display = 'flex';
        flightsList.style.flexDirection = 'column';
        flightsList.style.gap = '16px';
    }
}

function modifySearch() {
    // Hide results and show all sections again
    document.getElementById('flightResults').style.display = 'none';
    document.querySelector('.popular-destinations').style.display = 'block';
    document.querySelector('.flight-packages').style.display = 'block';
    document.querySelector('.ready-itineraries').style.display = 'block';
    document.querySelector('.why-choose-us').style.display = 'block';
    document.querySelector('.travel-tips').style.display = 'block';
    
    // Scroll to search form
    document.querySelector('.flight-hero').scrollIntoView({ behavior: 'smooth' });
}

function toggleTimeFilter(element) {
    element.classList.toggle('active');
    console.log('Time filter toggled');
}

// Select destination (auto-fills search form)
function selectDestination(destination) {
    const destinations = {
        'paris': 'Paris (CDG)',
        'tokyo': 'Tokyo (NRT)', 
        'london': 'London (LHR)',
        'bali': 'Bali (DPS)'
    };
    
    document.getElementById('toCity').value = destinations[destination] || destination;
    document.querySelector('.flight-hero').scrollIntoView({ behavior: 'smooth' });
    
    // Auto-focus on departure date
    setTimeout(() => {
        document.getElementById('departDate').focus();
    }, 500);
}

function updatePriceRange() {
    const priceRange = document.getElementById('priceRange');
    const maxPrice = document.getElementById('maxPrice');
    if (maxPrice && priceRange) {
        maxPrice.textContent = `$${priceRange.value}`;
    }
}

function viewPackage(packageId) {
    alert('Package details would be shown here');
}

function viewItinerary(itineraryId) {
    alert('Itinerary details would be shown here');
}

function formatDate(dateString) {
    if (!dateString) return 'Flexible';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Set default dates
    const today = new Date();
    const departDate = new Date(today);
    departDate.setDate(today.getDate() + 14);
    
    const returnDate = new Date(departDate);
    returnDate.setDate(departDate.getDate() + 7);
    
    const departInput = document.getElementById('departDate');
    const returnInput = document.getElementById('returnDate');
    
    if (departInput) {
        departInput.value = departDate.toISOString().split('T')[0];
    }
    if (returnInput) {
        returnInput.value = returnDate.toISOString().split('T')[0];
    }
    
    // Set default from city
    const fromInput = document.getElementById('fromCity');
    if (fromInput) {
        fromInput.value = 'New York (NYC)';
    }
    
    // Load recent searches on page load
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    if (recentSearches.length > 0) {
        document.getElementById('recentSearches').style.display = 'block';
        loadRecentSearches();
    }
    
    // Show price alerts if any exist
    const priceAlerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
    if (priceAlerts.length > 0) {
        document.getElementById('priceAlertsSection').style.display = 'block';
    }
});

// Save recent search
function saveRecentSearch(from, to, depart, returnDate, travelers) {
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const newSearch = {
        id: Date.now(),
        from: from,
        to: to,
        departDate: depart,
        returnDate: returnDate,
        travelers: travelers,
        searchedAt: new Date().toISOString()
    };
    
    // Add to beginning and keep only last 5
    searches.unshift(newSearch);
    const limitedSearches = searches.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(limitedSearches));
}

// Load recent searches
function loadRecentSearches() {
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const grid = document.getElementById('recentSearchesGrid');
    
    if (searches.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--color-azure-52);">No recent searches yet</p>';
        return;
    }
    
    grid.innerHTML = searches.map(search => `
        <div class="search-card" onclick="repeatSearch('${search.id}')">
            <div class="search-route">
                <span class="from">${search.from.split('(')[0].trim()}</span>
                <span class="arrow">→</span>
                <span class="to">${search.to.split('(')[0].trim()}</span>
            </div>
            <div class="search-details">
                <span class="dates">${formatSearchDate(search.departDate)} ${search.returnDate ? '- ' + formatSearchDate(search.returnDate) : ''}</span>
                <span class="travelers">${search.travelers}</span>
            </div>
            <div class="search-time">${formatTimeAgo(search.searchedAt)}</div>
        </div>
    `).join('');
}

// Repeat search
function repeatSearch(searchId) {
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const search = searches.find(s => s.id == searchId);
    
    if (search) {
        // Fill form with previous search
        document.getElementById('fromCity').value = search.from;
        document.getElementById('toCity').value = search.to;
        document.getElementById('departDate').value = search.departDate;
        if (search.returnDate) {
            document.getElementById('returnDate').value = search.returnDate;
        }
        document.getElementById('travelers').value = search.travelers;
        
        // Scroll to search form
        document.querySelector('.flight-hero').scrollIntoView({ behavior: 'smooth' });
        
        // Auto-search after a brief delay
        setTimeout(() => {
            searchFlights();
        }, 500);
    }
}

// Format search date
function formatSearchDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

// Setup new alert
function setupNewAlert() {
    const route = prompt('Enter route (e.g., NYC → London):');
    const targetPrice = prompt('Alert me when price drops below: $');
    
    if (route && targetPrice) {
        alert(`✅ Price alert set!\n\nRoute: ${route}\nTarget price: $${targetPrice}\n\nWe'll email you when prices drop.`);
    }
}

// Remove alert
function removeAlert(alertId) {
    if (confirm('Remove this price alert?')) {
        alert('Price alert removed successfully.');
        // In real implementation, remove from localStorage and update UI
    }
}