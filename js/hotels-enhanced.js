// Enhanced Hotels JavaScript - Matching Flight Details Pattern
class EnhancedHotelSearch {
    constructor() {
        this.searchResults = [];
        this.currentFilters = {
            priceRange: 250,
            starRating: [],
            amenities: [],
            propertyType: [],
            sortBy: 'recommended'
        };
        this.bindEvents();
        this.initializeDates();
    }

    bindEvents() {
        // Search form
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchHotels());
        }

        // Destination cards
        document.querySelectorAll('.destination-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleDestinationClick(e));
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });

        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleViewClick(e));
        });

        // Price range
        const priceRange = document.getElementById('priceRange');
        if (priceRange) {
            priceRange.addEventListener('input', (e) => this.updatePriceRange(e));
        }

        // Filter checkboxes
        document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.applyFilters());
        });
    }

    initializeDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 2);

        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');

        if (checkinInput) {
            checkinInput.value = tomorrow.toISOString().split('T')[0];
        }
        if (checkoutInput) {
            checkoutInput.value = dayAfter.toISOString().split('T')[0];
        }
    }

    searchHotels() {
        const destination = document.getElementById('destination').value;
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const guests = document.getElementById('guests').value;

        if (!destination || !checkin || !checkout) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Show loading state
        const searchBtn = document.querySelector('.search-btn');
        const originalContent = searchBtn.innerHTML;
        searchBtn.innerHTML = '<span>⏳</span><span>Searching...</span>';
        searchBtn.disabled = true;

        // Simulate search delay with progress
        this.showSearchProgress();

        setTimeout(() => {
            this.displayResults(destination, checkin, checkout, guests);
            searchBtn.innerHTML = originalContent;
            searchBtn.disabled = false;
            this.hideSearchProgress();
        }, 2000);
    }

    showSearchProgress() {
        // Create progress indicator
        const progressHtml = `
            <div class="search-progress" id="searchProgress">
                <div class="progress-container">
                    <div class="progress-text">🔍 Searching hotels...</div>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-steps">
                        <span class="step active">Finding hotels</span>
                        <span class="step">Checking availability</span>
                        <span class="step">Comparing prices</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', progressHtml);
        
        // Animate progress steps
        setTimeout(() => {
            const steps = document.querySelectorAll('.progress-steps .step');
            steps[1].classList.add('active');
        }, 600);
        
        setTimeout(() => {
            const steps = document.querySelectorAll('.progress-steps .step');
            steps[2].classList.add('active');
        }, 1200);
    }

    hideSearchProgress() {
        const progress = document.getElementById('searchProgress');
        if (progress) {
            progress.remove();
        }
    }

    displayResults(destination, checkin, checkout, guests) {
        // Update results header
        document.getElementById('locationTitle').textContent = `Hotels in ${destination}`;
        document.getElementById('searchSummary').textContent = `${this.formatDate(checkin)} - ${this.formatDate(checkout)} • ${guests}`;
        document.getElementById('resultsCount').textContent = 'Found 247 hotels';

        // Show results section
        document.getElementById('hotelResults').style.display = 'block';
        document.getElementById('hotelResults').scrollIntoView({ behavior: 'smooth' });

        // Generate enhanced hotel results
        this.generateEnhancedHotelResults();
        
        // Show success notification
        this.showNotification('✅ Found 247 hotels matching your criteria', 'success');
    }

    generateEnhancedHotelResults() {
        const hotelsList = document.getElementById('hotelsList');
        const enhancedHotels = [
            {
                name: 'Le Grand Hotel Paris',
                rating: 4.8,
                reviews: 1247,
                price: 189,
                originalPrice: 229,
                image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=200&fit=crop',
                amenities: ['🌐 Free WiFi', '🍳 Breakfast', '🏊 Pool', '🚗 Parking', '🏋️ Fitness', '🛎️ Concierge'],
                location: 'Champs-Élysées, 0.2 km from center',
                features: ['Free cancellation', 'Breakfast included', 'Best price guarantee'],
                trustBadges: ['Verified', 'Top rated'],
                roomType: 'Deluxe King Room',
                lastBooked: '2 hours ago'
            },
            {
                name: 'Hotel Boutique Marais',
                rating: 4.6,
                reviews: 892,
                price: 145,
                originalPrice: 165,
                image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=200&fit=crop',
                amenities: ['🌐 Free WiFi', '🍳 Breakfast', '🏋️ Fitness', '🛎️ Concierge'],
                location: 'Le Marais, 0.5 km from center',
                features: ['Free cancellation', 'Historic building', 'Boutique style'],
                trustBadges: ['Verified'],
                roomType: 'Superior Double Room',
                lastBooked: '1 hour ago'
            },
            {
                name: 'Paris City Center Hotel',
                rating: 4.4,
                reviews: 2156,
                price: 98,
                originalPrice: 120,
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
                amenities: ['🌐 Free WiFi', '🚗 Parking', '🛎️ Concierge'],
                location: 'Latin Quarter, 0.3 km from center',
                features: ['Free cancellation', 'Central location', 'Budget friendly'],
                trustBadges: ['Verified', 'Great value'],
                roomType: 'Standard Double Room',
                lastBooked: '30 minutes ago'
            },
            {
                name: 'Luxury Seine View Hotel',
                rating: 4.9,
                reviews: 634,
                price: 299,
                originalPrice: 349,
                image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop',
                amenities: ['🌐 Free WiFi', '🍳 Breakfast', '🏊 Pool', '🚗 Parking', '🏋️ Fitness', '🛎️ Concierge', '🍷 Bar'],
                location: 'Seine Riverfront, 0.1 km from center',
                features: ['River view', 'Luxury amenities', 'Premium location'],
                trustBadges: ['Verified', 'Luxury', 'Top rated'],
                roomType: 'Seine View Suite',
                lastBooked: '15 minutes ago'
            }
        ];

        hotelsList.innerHTML = enhancedHotels.map(hotel => `
            <div class="hotel-card" onclick="viewHotelDetails('${hotel.name}')">
                <div class="hotel-main">
                    <div class="hotel-image-section">
                        <img src="${hotel.image}" alt="${hotel.name}" class="hotel-image">
                        <div class="savings-badge">Save $${hotel.originalPrice - hotel.price}</div>
                        ${hotel.lastBooked ? `<div class="booking-urgency">Last booked ${hotel.lastBooked}</div>` : ''}
                    </div>
                    
                    <div class="hotel-info">
                        <div class="hotel-header">
                            <div>
                                <h3>${hotel.name}</h3>
                                <div class="hotel-rating">
                                    <span class="stars">⭐</span>
                                    <span class="rating-score">${hotel.rating}</span>
                                    <span class="rating-count">(${hotel.reviews} reviews)</span>
                                </div>
                            </div>
                            <div class="trust-badges">
                                ${hotel.trustBadges.map(badge => `<span class="trust-badge">${badge}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="hotel-location">
                            <span class="location-icon">📍</span>
                            ${hotel.location}
                        </div>
                        
                        <div class="room-type">
                            <span class="room-icon">🛏️</span>
                            ${hotel.roomType}
                        </div>
                        
                        <div class="hotel-amenities">
                            ${hotel.amenities.slice(0, 4).map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
                            ${hotel.amenities.length > 4 ? `<span class="amenity-more">+${hotel.amenities.length - 4} more</span>` : ''}
                        </div>
                        
                        <div class="hotel-features">
                            ${hotel.features.slice(0, 2).map(feature => `<span class="feature-highlight">${feature}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="hotel-pricing">
                        <div class="price-info">
                            <span class="original-price">$${hotel.originalPrice}</span>
                            <span class="current-price">$${hotel.price}</span>
                            <span class="price-period">per night</span>
                        </div>
                        <div class="pricing-actions">
                            <button class="book-btn" onclick="event.stopPropagation(); viewHotelDetails('${hotel.name}')">
                                View Details
                            </button>
                            <button class="alert-btn" onclick="event.stopPropagation(); setPriceAlert('${hotel.name}')" title="Get price alerts">
                                🔔
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="hotel-details-row">
                    <div class="detail-items">
                        <div class="detail-item">
                            <span class="detail-icon">🔄</span>
                            <span>Free cancellation</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">🍳</span>
                            <span>Breakfast included</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">💳</span>
                            <span>No prepayment</span>
                        </div>
                    </div>
                    <div class="trust-indicators">
                        <div class="availability-indicator">
                            <span class="availability-dot"></span>
                            <span>Only 3 rooms left</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add enhanced styles
        this.addEnhancedStyles();
    }

    addEnhancedStyles() {
        const styles = `
        <style id="enhanced-hotel-styles">
        .search-progress {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }

        .progress-container {
            background: var(--color-white-solid);
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            min-width: 300px;
        }

        .progress-text {
            font-size: 18px;
            font-weight: 600;
            color: var(--color-blue-16);
            margin-bottom: 20px;
            font-family: 'DM Sans', sans-serif;
        }

        .progress-bar {
            width: 100%;
            height: 4px;
            background: var(--color-grey-91);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 20px;
        }

        .progress-fill {
            height: 100%;
            background: var(--color-azure-61);
            width: 0;
            animation: progressFill 2s ease-in-out forwards;
        }

        @keyframes progressFill {
            to { width: 100%; }
        }

        .progress-steps {
            display: flex;
            justify-content: space-between;
            gap: 12px;
        }

        .progress-steps .step {
            font-size: 12px;
            color: var(--color-azure-52);
            opacity: 0.5;
            transition: all 0.3s ease;
            font-family: 'Poppins', sans-serif;
        }

        .progress-steps .step.active {
            color: var(--color-azure-61);
            opacity: 1;
            font-weight: 600;
        }

        .booking-urgency {
            position: absolute;
            bottom: 12px;
            left: 12px;
            background: rgba(255, 107, 107, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 700;
            font-family: 'DM Sans', sans-serif;
        }

        .trust-badges {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }

        .trust-badge {
            background: var(--color-spring-green-55);
            color: white;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 700;
            font-family: 'DM Sans', sans-serif;
        }

        .trust-badge:nth-child(2) {
            background: var(--color-azure-61);
        }

        .trust-badge:nth-child(3) {
            background: var(--color-orange-70);
            color: var(--color-blue-16);
        }

        .room-type {
            font-size: 14px;
            color: var(--color-blue-16);
            margin-bottom: 8px;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .room-icon, .location-icon {
            font-size: 12px;
        }

        .amenity-more {
            background: var(--color-azure-61);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            font-family: 'DM Sans', sans-serif;
        }

        .availability-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #ff6b6b;
            font-weight: 600;
            font-family: 'DM Sans', sans-serif;
        }

        .availability-dot {
            width: 8px;
            height: 8px;
            background: #ff6b6b;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }

        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            font-family: 'DM Sans', sans-serif;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification.success {
            background: var(--color-spring-green-55);
            color: white;
        }

        .notification.error {
            background: #ff6b6b;
            color: white;
        }
        </style>
        `;
        
        if (!document.getElementById('enhanced-hotel-styles')) {
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }

    showNotification(message, type = 'success') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    handleDestinationClick(e) {
        const card = e.currentTarget;
        const destination = card.querySelector('h3').textContent;
        
        // Update search form
        document.getElementById('destination').value = destination;
        
        // Add loading state
        card.style.opacity = '0.7';
        card.style.pointerEvents = 'none';
        
        setTimeout(() => {
            this.searchHotels();
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        }, 500);
    }

    handleFilterClick(e) {
        const btn = e.currentTarget;
        const filterType = btn.onclick.toString().match(/'([^']+)'/)[1];
        
        // Remove active class from all filter buttons
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Update current filter
        this.currentFilters.sortBy = filterType;
        
        // Apply filters with animation
        this.applyFiltersWithAnimation();
    }

    handleViewClick(e) {
        const btn = e.currentTarget;
        
        // Remove active class from all view buttons
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Apply view change
        const viewType = btn.onclick.toString().match(/'([^']+)'/)[1];
        this.changeView(viewType);
    }

    changeView(viewType) {
        const hotelsList = document.getElementById('hotelsList');
        if (!hotelsList) return;

        if (viewType === 'grid') {
            hotelsList.style.display = 'grid';
            hotelsList.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
            hotelsList.style.gap = '20px';
        } else {
            hotelsList.style.display = 'flex';
            hotelsList.style.flexDirection = 'column';
            hotelsList.style.gap = '16px';
        }
    }

    updatePriceRange(e) {
        const value = e.target.value;
        document.getElementById('maxPrice').textContent = `$${value}`;
        this.currentFilters.priceRange = parseInt(value);
        this.applyFiltersWithAnimation();
    }

    applyFiltersWithAnimation() {
        const hotelsList = document.getElementById('hotelsList');
        if (hotelsList) {
            hotelsList.style.opacity = '0.5';
            hotelsList.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                hotelsList.style.opacity = '1';
                hotelsList.style.transform = 'translateY(0)';
                hotelsList.style.transition = 'all 0.3s ease';
            }, 300);
        }
        
        // Show filter feedback
        this.showNotification(`Filters applied: ${this.currentFilters.sortBy}`, 'success');
    }

    applyFilters() {
        this.applyFiltersWithAnimation();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Global functions for onclick handlers
function searchHotels() {
    if (window.enhancedHotelSearch) {
        window.enhancedHotelSearch.searchHotels();
    }
}

function selectDestination(destination) {
    const destinationMap = {
        'paris': 'Paris, France',
        'tokyo': 'Tokyo, Japan',
        'london': 'London, UK',
        'bali': 'Bali, Indonesia'
    };
    
    document.getElementById('destination').value = destinationMap[destination] || destination;
    if (window.enhancedHotelSearch) {
        window.enhancedHotelSearch.searchHotels();
    }
}

function filterHotels(filterType) {
    console.log('Filter by:', filterType);
}

function setView(viewType) {
    console.log('Set view:', viewType);
}

function modifySearch() {
    document.querySelector('.hotel-search').scrollIntoView({ behavior: 'smooth' });
}

function viewHotelDetails(hotelName) {
    // Show loading state
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = `Loading ${hotelName} details...`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Navigate to hotel details page after delay
    setTimeout(() => {
        window.location.href = `hotel-details.html?hotel=${encodeURIComponent(hotelName)}`;
    }, 1000);
}

function setPriceAlert(hotelName) {
    // Enhanced price alert with better UX
    const alertHtml = `
        <div class="price-alert-modal" id="priceAlertModal">
            <div class="modal-overlay" onclick="closePriceAlert()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔔 Set Price Alert</h3>
                    <button class="close-btn" onclick="closePriceAlert()">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Hotel:</strong> ${hotelName}</p>
                    <div class="alert-options">
                        <label>
                            <input type="radio" name="alertType" value="any" checked>
                            <span>Any price drop</span>
                        </label>
                        <label>
                            <input type="radio" name="alertType" value="percentage">
                            <span>10% or more discount</span>
                        </label>
                        <label>
                            <input type="radio" name="alertType" value="specific">
                            <span>Below specific price</span>
                        </label>
                    </div>
                    <input type="email" placeholder="Your email address" class="email-input">
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closePriceAlert()">Cancel</button>
                    <button class="btn-primary" onclick="confirmPriceAlert('${hotelName}')">Set Alert</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', alertHtml);
}

function closePriceAlert() {
    const modal = document.getElementById('priceAlertModal');
    if (modal) {
        modal.remove();
    }
}

function confirmPriceAlert(hotelName) {
    closePriceAlert();
    if (window.enhancedHotelSearch) {
        window.enhancedHotelSearch.showNotification(`✅ Price alert set for ${hotelName}!`, 'success');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedHotelSearch = new EnhancedHotelSearch();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add modal styles
const modalStyles = `
<style>
.price-alert-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.modal-content {
    background: var(--color-white-solid);
    border-radius: 16px;
    width: 90%;
    max-width: 400px;
    position: relative;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid var(--color-grey-91);
}

.modal-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-blue-16);
    font-family: 'DM Sans', sans-serif;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--color-azure-52);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background: var(--color-grey-91);
    color: var(--color-blue-16);
}

.modal-body {
    padding: 24px;
}

.alert-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 16px 0;
}

.alert-options label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
}

.email-input {
    width: 100%;
    padding: 12px;
    border: 2px solid var(--color-grey-91);
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    margin-top: 16px;
}

.email-input:focus {
    outline: none;
    border-color: var(--color-azure-61);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 24px;
    border-top: 1px solid var(--color-grey-91);
}

.btn-secondary {
    background: var(--color-white-solid);
    border: 2px solid var(--color-grey-91);
    color: var(--color-azure-52);
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'DM Sans', sans-serif;
}

.btn-secondary:hover {
    border-color: var(--color-azure-61);
    color: var(--color-azure-61);
}

.btn-primary {
    background: var(--color-azure-61);
    border: 2px solid var(--color-azure-61);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'DM Sans', sans-serif;
}

.btn-primary:hover {
    background: var(--color-spring-green-55);
    border-color: var(--color-spring-green-55);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', modalStyles);