// Hotels JavaScript - Matching Flight Details Pattern
class HotelSearch {
    constructor() {
        this.searchResults = [];
        this.currentFilters = {
            priceRange: 250,
            starRating: [],
            amenities: [],
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

        // Simulate search delay
        setTimeout(() => {
            this.displayResults(destination, checkin, checkout, guests);
            searchBtn.innerHTML = originalContent;
            searchBtn.disabled = false;
            this.showNotification('✅ Found 247 hotels matching your criteria', 'success');
        }, 1500);
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

    displayResults(destination, checkin, checkout, guests) {
        // Update results header
        document.getElementById('locationTitle').textContent = `Hotels in ${destination}`;
        document.getElementById('searchSummary').textContent = `${this.formatDate(checkin)} - ${this.formatDate(checkout)} • ${guests}`;
        document.getElementById('resultsCount').textContent = 'Found 247 hotels';

        // Show results section
        document.getElementById('hotelResults').style.display = 'block';
        document.getElementById('hotelResults').scrollIntoView({ behavior: 'smooth' });

        // Generate sample hotel results
        this.generateHotelResults();
    }

    generateHotelResults() {
        const hotelsList = document.getElementById('hotelsList');
        const sampleHotels = [
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
                lastBooked: '30 minutes ago'
            }
        ];

        hotelsList.innerHTML = sampleHotels.map(hotel => `
            <div class="hotel-card" onclick="viewHotelDetails('${hotel.name}')">
                <div class="hotel-main">
                    <div class="hotel-image-section">
                        <img src="${hotel.image}" alt="${hotel.name}" class="hotel-image">
                        <button class="more-images-btn" onclick="event.stopPropagation(); showMoreImages('${hotel.name}')">+4</button>
                        <div class="savings-badge">Save $${hotel.originalPrice - hotel.price}</div>
                    </div>
                    
                    <div class="hotel-info">
                        <div class="hotel-header">
                            <h3>${hotel.name}</h3>
                            <div class="hotel-rating">
                                <span class="stars">⭐</span>
                                <span class="rating-score">${hotel.rating}</span>
                                <span class="rating-count">(${hotel.reviews} reviews)</span>
                            </div>
                        </div>
                        <div class="hotel-location">${hotel.location}</div>
                        <div class="hotel-amenities">
                            ${hotel.amenities.slice(0, 3).join(' • ')}
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
                            <button class="book-now-btn" onclick="event.stopPropagation(); bookHotel('${hotel.name}')">
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="hotel-details-row">
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
                    <div class="hotel-features">
                        ${hotel.features ? hotel.features.slice(0, 2).map(feature => `<span class="feature-tag">${feature}</span>`).join('') : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Add hotel card styles
        this.addHotelCardStyles();
    }

    addHotelCardStyles() {
        const styles = `
        <style>
        .hotel-card {
            background: var(--color-white-solid);
            border: 1px solid var(--color-grey-91);
            border-radius: 12px;
            padding: 0;
            cursor: pointer;
            transition: all 0.3s ease;
            overflow: hidden;
            margin-bottom: 12px;
        }

        .hotel-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            border-color: var(--color-azure-61);
        }

        .hotel-main {
            display: grid;
            grid-template-columns: 300px 1fr 120px;
            gap: 16px;
            padding: 16px;
            align-items: start;
        }

        .hotel-image-section {
            position: relative;
            display: flex;
            align-items: center;
        }

        .more-images-btn {
            position: absolute;
            bottom: 6px;
            right: 6px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
        }

        .hotel-image {
            width: 300px;
            height: 180px;
            object-fit: cover;
            border-radius: 8px;
        }

        .savings-badge {
            position: absolute;
            top: 12px;
            left: 12px;
            background: var(--color-spring-green-55);
            color: white;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            font-family: 'DM Sans', sans-serif;
        }

        .hotel-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            justify-content: flex-start;
        }

        .hotel-header {
            margin: 0;
        }

        .hotel-header h3 {
            font-size: 16px;
            font-weight: 600;
            color: var(--color-blue-16);
            margin: 0;
            font-family: 'DM Sans', sans-serif;
            line-height: 1.2;
        }

        .hotel-rating {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 14px;
        }

        .stars {
            color: var(--color-orange-70);
        }

        .rating-score {
            font-weight: 600;
            color: var(--color-blue-16);
            font-family: 'DM Sans', sans-serif;
        }

        .rating-count {
            color: var(--color-azure-52);
            font-family: 'Poppins', sans-serif;
        }

        .hotel-location {
            font-size: 12px;
            color: var(--color-azure-52);
            margin-bottom: 3px;
            font-family: 'Poppins', sans-serif;
            line-height: 1.3;
        }

        .hotel-amenities {
            font-size: 12px;
            color: var(--color-azure-52);
            font-family: 'Poppins', sans-serif;
            line-height: 1.3;
        }

        .hotel-pricing {
            text-align: right;
        }

        .price-info {
            margin-bottom: 12px;
        }

        .original-price {
            font-size: 14px;
            color: var(--color-azure-52);
            text-decoration: line-through;
            margin-bottom: 4px;
            font-family: 'Poppins', sans-serif;
        }

        .current-price {
            font-size: 26px;
            font-weight: 700;
            color: var(--color-blue-16);
            margin-bottom: 3px;
            font-family: 'DM Sans', sans-serif;
            line-height: 1.1;
        }

        .price-period {
            font-size: 12px;
            color: var(--color-azure-52);
            margin-bottom: 12px;
            font-family: 'Poppins', sans-serif;
        }

        .pricing-actions {
            display: flex;
            flex-direction: column;
            gap: 6px;
            align-items: flex-end;
        }

        .book-now-btn {
            background: var(--color-spring-green-55);
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'DM Sans', sans-serif;
            width: 100%;
        }

        .book-now-btn:hover {
            background: var(--color-azure-61);
            transform: translateY(-1px);
        }

        .book-btn {
            background: var(--color-azure-61);
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'DM Sans', sans-serif;
            width: 100%;
        }

        .book-btn:hover {
            background: var(--color-spring-green-55);
            transform: translateY(-1px);
        }

        .alert-btn {
            background: transparent;
            border: 2px solid var(--color-grey-91);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }

        .alert-btn:hover {
            border-color: var(--color-azure-61);
            background: var(--color-azure-61);
        }

        .hotel-details-row {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 12px 16px;
            background: var(--color-grey-99);
            border-top: 1px solid var(--color-grey-91);
        }

        .detail-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--color-azure-52);
            font-family: 'Poppins', sans-serif;
        }

        .detail-icon {
            font-size: 14px;
        }

        .hotel-features {
            display: flex;
            gap: 8px;
            margin-left: auto;
        }

        .feature-tag {
            background: var(--color-white-solid);
            color: var(--color-azure-52);
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 600;
            border: 1px solid var(--color-grey-91);
            font-family: 'DM Sans', sans-serif;
        }

        .amenity-tag {
            background: var(--color-grey-99);
            color: var(--color-azure-52);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            font-family: 'DM Sans', sans-serif;
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

        .feature-highlight {
            background: var(--color-spring-green-55);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
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

        .location-icon {
            font-size: 12px;
        }

        .trust-indicators {
            display: flex;
            gap: 16px;
            align-items: center;
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

        .image-gallery-modal {
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
            background: rgba(0, 0, 0, 0.8);
        }

        .gallery-content {
            background: white;
            border-radius: 12px;
            padding: 20px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        }

        .images-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin: 16px 0;
        }

        .images-grid img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 8px;
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

        @media (max-width: 768px) {
            .hotel-main {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            
            .hotel-image {
                width: 100%;
                height: 150px;
            }
            
            .hotel-info {
                padding: 0;
            }
            
            .hotel-pricing {
                text-align: left;
                padding-left: 0;
            }
            
            .hotel-details-row {
                flex-direction: column;
                gap: 12px;
                align-items: flex-start;
            }
            
            .detail-items {
                flex-wrap: wrap;
                gap: 16px;
            }
        }
        </style>
        `;
        
        if (!document.getElementById('hotel-card-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'hotel-card-styles';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement);
        }
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
        
        // Apply filters
        this.applyFilters();
    }

    handleViewClick(e) {
        const btn = e.currentTarget;
        
        // Remove active class from all view buttons
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Apply view change (placeholder)
        console.log('View changed to:', btn.onclick.toString().match(/'([^']+)'/)[1]);
    }

    updatePriceRange(e) {
        const value = e.target.value;
        document.getElementById('maxPrice').textContent = `$${value}`;
        this.currentFilters.priceRange = parseInt(value);
        this.applyFilters();
    }

    applyFilters() {
        // Placeholder for filter application
        console.log('Applying filters:', this.currentFilters);
        
        // In a real app, this would filter the hotel results
        // For now, just show a brief loading state
        const hotelsList = document.getElementById('hotelsList');
        if (hotelsList) {
            hotelsList.style.opacity = '0.7';
            setTimeout(() => {
                hotelsList.style.opacity = '1';
            }, 300);
        }
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
    if (window.hotelSearch) {
        window.hotelSearch.searchHotels();
    }
}

function selectDestination(destination) {
    console.log('Selected destination:', destination);
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
    // Navigate to hotel details page
    window.location.href = `hotel-details.html?hotel=${encodeURIComponent(hotelName)}`;
}

function setPriceAlert(hotelName) {
    if (window.hotelSearch) {
        window.hotelSearch.showNotification(`🔔 Price alert set for ${hotelName}!`, 'success');
    }
}

function showMoreImages(hotelName) {
    // Show image gallery modal
    const images = [
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop'
    ];
    
    const modal = document.createElement('div');
    modal.className = 'image-gallery-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="gallery-content">
            <h3>${hotelName} - Photos</h3>
            <div class="images-grid">
                ${images.map(img => `<img src="${img}" alt="Hotel photo">`).join('')}
            </div>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function bookHotel(hotelName) {
    if (window.hotelSearch) {
        window.hotelSearch.showNotification(`🎉 Booking ${hotelName}...`, 'success');
    }
    setTimeout(() => {
        window.location.href = `hotel-booking.html?hotel=${encodeURIComponent(hotelName)}`;
    }, 1000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hotelSearch = new HotelSearch();
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