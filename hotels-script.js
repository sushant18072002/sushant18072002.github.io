// Hotels Page JavaScript - Complete Functionality

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    setDefaultDates();
    loadSampleHotels();
    setTimeout(() => {
        loadHotelResults();
        updateResultsHeader('Paris, France', '2024-12-20', '2024-12-23', '2 Adults, 1 Room');
    }, 100);
});

// Initialize page functionality
function initializePage() {
    // Price range slider
    const priceRange = document.getElementById('priceRange');
    const maxPrice = document.getElementById('maxPrice');
    
    if (priceRange && maxPrice) {
        priceRange.addEventListener('input', function() {
            maxPrice.textContent = `$${this.value}`;
        });
    }
    
    // Load hotels immediately
    loadHotelResults();
    updateResultsHeader('Paris, France', '2024-12-20', '2024-12-23', '2 Adults, 1 Room');
}

// Set default check-in and check-out dates
function setDefaultDates() {
    const today = new Date();
    const checkin = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
    const checkout = new Date(checkin.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    if (checkinInput) checkinInput.value = checkin.toISOString().split('T')[0];
    if (checkoutInput) checkoutInput.value = checkout.toISOString().split('T')[0];
}

// Search hotels function
function searchHotels() {
    const destination = document.getElementById('destination').value;
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const guests = document.getElementById('guests').value;
    
    if (!destination) {
        alert('Please enter a destination');
        return;
    }
    
    // Show loading state
    const searchBtn = document.querySelector('.search-btn');
    const originalContent = searchBtn.innerHTML;
    searchBtn.innerHTML = '<span>⏳</span>';
    searchBtn.disabled = true;
    
    // Simulate search delay
    setTimeout(() => {
        // Update results header
        updateResultsHeader(destination, checkin, checkout, guests);
        
        // Load hotel results
        loadHotelResults();
        
        // Restore search button
        searchBtn.innerHTML = originalContent;
        searchBtn.disabled = false;
    }, 800);
}

// Update results header
function updateResultsHeader(destination, checkin, checkout, guests) {
    const locationTitle = document.getElementById('locationTitle');
    const searchSummary = document.getElementById('searchSummary');
    const resultsCount = document.getElementById('resultsCount');
    
    if (locationTitle) locationTitle.textContent = `Hotels in ${destination}`;
    
    if (searchSummary) {
        const checkinDate = new Date(checkin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const checkoutDate = new Date(checkout).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        searchSummary.textContent = `${checkinDate} - ${checkoutDate} • ${guests}`;
    }
    
    if (resultsCount) {
        const count = Math.floor(Math.random() * 200) + 50;
        resultsCount.textContent = `Found ${count} hotels`;
    }
}

// Select destination from popular destinations
function selectDestination(destination) {
    const destinationMap = {
        'paris': 'Paris, France',
        'tokyo': 'Tokyo, Japan',
        'london': 'London, UK',
        'bali': 'Bali, Indonesia'
    };
    
    document.getElementById('destination').value = destinationMap[destination] || destination;
    searchHotels();
}

// Load sample hotels for demonstration
function loadSampleHotels() {
    const sampleHotels = [
        {
            id: 'hotel1',
            name: 'Hotel Le Grand Paris',
            image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=200&fit=crop',
            rating: 4.8,
            reviews: 1247,
            location: 'Champs-Élysées',
            amenities: 'WiFi • Pool • Spa',
            originalPrice: 334,
            currentPrice: 245,
            badge: 'Featured'
        },
        {
            id: 'hotel2',
            name: 'Paris Central Hotel',
            image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=200&fit=crop',
            rating: 4.6,
            reviews: 892,
            location: 'Marais District',
            amenities: 'WiFi • Restaurant • Bar',
            currentPrice: 180
        },
        {
            id: 'hotel3',
            name: 'Boutique Seine Hotel',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
            rating: 4.9,
            reviews: 654,
            location: 'Saint-Germain',
            amenities: 'WiFi • Breakfast • Gym',
            currentPrice: 220,
            badge: 'Popular'
        },
        {
            id: 'hotel4',
            name: 'Hotel Montmartre',
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop',
            rating: 4.7,
            reviews: 456,
            location: 'Montmartre',
            amenities: 'WiFi • Terrace • Bar',
            originalPrice: 280,
            currentPrice: 210
        },
        {
            id: 'hotel5',
            name: 'Luxury Palace Hotel',
            image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop',
            rating: 4.9,
            reviews: 2156,
            location: 'Opera District',
            amenities: 'WiFi • Spa • Concierge',
            currentPrice: 420,
            badge: 'Luxury'
        },
        {
            id: 'hotel6',
            name: 'Budget Friendly Inn',
            image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&h=200&fit=crop',
            rating: 4.2,
            reviews: 789,
            location: 'Latin Quarter',
            amenities: 'WiFi • Breakfast',
            currentPrice: 95
        }
    ];
    
    // Store sample data globally for use in results
    window.sampleHotels = sampleHotels;
}

// Load hotel results
function loadHotelResults() {
    const hotelsList = document.getElementById('hotelsList');
    if (!hotelsList || !window.sampleHotels) return;
    
    hotelsList.innerHTML = '';
    
    window.sampleHotels.forEach(hotel => {
        const hotelCard = createHotelCard(hotel);
        hotelsList.appendChild(hotelCard);
    });
}

// Create hotel card element
function createHotelCard(hotel) {
    const card = document.createElement('div');
    card.className = 'hotel-card';
    card.onclick = () => viewHotelDetails(hotel.id);
    
    const badge = hotel.badge ? `<div class="hotel-badge">${hotel.badge}</div>` : '';
    const originalPrice = hotel.originalPrice ? `<span class="original-price">$${hotel.originalPrice}</span>` : '';
    const stars = '★'.repeat(Math.floor(hotel.rating));
    
    card.innerHTML = `
        <div class="hotel-image">
            <img src="${hotel.image}" alt="${hotel.name}">
            ${badge}
        </div>
        <div class="hotel-content">
            <h3>${hotel.name}</h3>
            <div class="hotel-rating">
                <span class="stars">${stars}</span>
                <span class="rating-score">${hotel.rating}</span>
                <span class="review-count">(${hotel.reviews})</span>
            </div>
            <div class="hotel-location">📍 ${hotel.location}</div>
            <div class="hotel-amenities">${hotel.amenities}</div>
            <div class="hotel-footer">
                <div class="hotel-price">
                    ${originalPrice}
                    <span class="current-price">$${hotel.currentPrice}</span>
                    <span class="price-period">per night</span>
                </div>
                <button class="book-btn" onclick="event.stopPropagation(); bookHotel('${hotel.id}')">Book</button>
            </div>
        </div>
    `;
    
    return card;
}

// Filter hotels
function filterHotels(filterType) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Simulate filtering (in real app, this would filter actual data)
    console.log(`Filtering hotels by: ${filterType}`);
    
    // Show loading state briefly
    const hotelsList = document.getElementById('hotelsList');
    if (hotelsList) {
        hotelsList.style.opacity = '0.5';
        setTimeout(() => {
            hotelsList.style.opacity = '1';
        }, 500);
    }
}

// Set view type
function setView(viewType) {
    // Update active view button
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const hotelsList = document.getElementById('hotelsList');
    if (!hotelsList) return;
    
    if (viewType === 'grid') {
        hotelsList.className = 'hotels-grid';
    } else {
        hotelsList.className = 'hotels-list';
    }
    
    console.log(`View changed to: ${viewType}`);
}

// Modify search
function modifySearch() {
    const hotelResults = document.getElementById('hotelResults');
    if (hotelResults) {
        hotelResults.style.display = 'none';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// View hotel details
function viewHotelDetails(hotelId) {
    console.log(`Viewing details for hotel: ${hotelId}`);
    // In real app, navigate to hotel details page
    window.location.href = `hotel-details.html?id=${hotelId}`;
}

// Book hotel
function bookHotel(hotelId) {
    console.log(`Booking hotel: ${hotelId}`);
    
    // Show booking confirmation modal
    showBookingModal(hotelId);
}

// Show booking modal
function showBookingModal(hotelId) {
    const modal = document.createElement('div');
    modal.className = 'booking-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 32px; max-width: 500px; text-align: center;">
            <h3 style="margin-bottom: 16px; color: var(--color-blue-16);">Complete Your Booking</h3>
            <p style="margin-bottom: 24px; color: var(--color-azure-52);">Add extras to enhance your stay</p>
            
            <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                <div style="flex: 1; border: 2px solid var(--color-grey-91); border-radius: 12px; padding: 16px; cursor: pointer;" onclick="selectExtra('package')">
                    <div style="font-size: 24px; margin-bottom: 8px;">✈️</div>
                    <strong>+ Flight Package</strong>
                    <div style="color: var(--color-spring-green-55); font-weight: 600;">Save $200</div>
                </div>
                <div style="flex: 1; border: 2px solid var(--color-grey-91); border-radius: 12px; padding: 16px; cursor: pointer;" onclick="selectExtra('none')">
                    <div style="font-size: 24px; margin-bottom: 8px;">🏨</div>
                    <strong>Hotel Only</strong>
                    <div style="color: var(--color-azure-52);">Continue booking</div>
                </div>
            </div>
            
            <button onclick="closeBookingModal()" style="background: var(--color-grey-91); border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">Maybe Later</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add global functions for modal
    window.selectExtra = function(type) {
        document.body.removeChild(modal);
        if (type === 'package') {
            window.location.href = `packages.html?hotel=${hotelId}&type=flight`;
        } else {
            window.location.href = `hotel-booking.html?hotel=${hotelId}`;
        }
    };
    
    window.closeBookingModal = function() {
        document.body.removeChild(modal);
    };
}

// Toggle favorite
function toggleFavorite(hotelId) {
    const favoriteBtn = event.target;
    const isFavorited = favoriteBtn.textContent === '♥';
    
    favoriteBtn.textContent = isFavorited ? '♡' : '♥';
    favoriteBtn.style.color = isFavorited ? 'var(--color-azure-52)' : '#e74c3c';
    
    console.log(`${isFavorited ? 'Removed from' : 'Added to'} favorites: ${hotelId}`);
}

// Social proof simulation
function startSocialProof() {
    const activities = [
        'Sarah M. just booked Hotel Le Grand Paris',
        'James R. just booked Paris Central Hotel',
        'Emma L. just booked Boutique Seine Hotel',
        'Carlos D. just booked Hotel Le Grand Paris'
    ];
    
    let index = 0;
    setInterval(() => {
        // Update viewing counts randomly
        document.querySelectorAll('.viewing-info').forEach(element => {
            const currentCount = parseInt(element.textContent.match(/\d+/)[0]);
            const newCount = Math.max(1, currentCount + Math.floor(Math.random() * 3) - 1);
            element.textContent = `👥 ${newCount} people viewing`;
        });
        
        index = (index + 1) % activities.length;
    }, 5000);
}

// Start social proof when results are shown
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(startSocialProof, 2000);
});