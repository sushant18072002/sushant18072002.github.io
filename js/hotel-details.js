// Hotel Details JavaScript - Matching Flight Details Pattern
class HotelDetails {
    constructor() {
        this.checkinDate = null;
        this.checkoutDate = null;
        this.guestCount = 1;
        this.pricePerNight = 109;
        this.originalPrice = 119;
        this.serviceFee = 103;
        this.bindEvents();
    }

    bindEvents() {
        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleActionClick(e));
        });

        // Gallery
        const showAllPhotos = document.getElementById('showAllPhotos');
        if (showAllPhotos) {
            showAllPhotos.addEventListener('click', () => this.showPhotoGallery());
        }

        // Date inputs
        const checkinInput = document.getElementById('checkinDate');
        const checkoutInput = document.getElementById('checkoutDate');
        
        if (checkinInput) {
            checkinInput.addEventListener('click', () => this.showDatePicker('checkin'));
        }
        
        if (checkoutInput) {
            checkoutInput.addEventListener('click', () => this.showDatePicker('checkout'));
        }

        // Guest selector
        const guestSelector = document.getElementById('guestSelector');
        if (guestSelector) {
            guestSelector.addEventListener('click', () => this.showGuestSelector());
        }

        // Booking buttons
        const saveBtn = document.getElementById('saveBtn');
        const reserveBtn = document.getElementById('reserveBtn');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProperty());
        }
        
        if (reserveBtn) {
            reserveBtn.addEventListener('click', () => this.reserveProperty());
        }

        // Itinerary buttons
        document.querySelectorAll('.itinerary-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.viewItinerary(e));
        });

        // Reviews
        const showMoreReviews = document.querySelector('.show-more-reviews');
        if (showMoreReviews) {
            showMoreReviews.addEventListener('click', () => this.showAllReviews());
        }

        // Contact host
        const contactHostBtn = document.querySelector('.contact-host-btn');
        if (contactHostBtn) {
            contactHostBtn.addEventListener('click', () => this.contactHost());
        }

        // Similar hotels
        document.querySelectorAll('.hotel-card').forEach(card => {
            card.addEventListener('click', (e) => this.viewSimilarHotel(e));
        });
    }

    handleActionClick(e) {
        const action = e.currentTarget.dataset.action;
        
        // Visual feedback first
        e.currentTarget.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.currentTarget.style.transform = 'scale(1)';
        }, 150);
        
        switch(action) {
            case 'location':
                this.showLocation();
                break;
            case 'share':
                this.shareProperty();
                break;
            case 'favorite':
                this.toggleFavorite(e.currentTarget);
                break;
        }
    }

    showPhotoGallery() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Hotel Photos</h3>
                    <button class="close-btn" onclick="this.closest('.photo-modal').remove()">&times;</button>
                </div>
                <div class="photo-grid">
                    <img src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop" alt="Hotel view">
                    <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop" alt="Hotel lobby">
                    <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop" alt="Hotel room">
                    <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop" alt="Hotel restaurant">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showDatePicker(type) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (type === 'checkin') {
            this.checkinDate = today;
            const dateElement = document.querySelector('#checkinDate .date-value');
            if (dateElement) {
                dateElement.textContent = today.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
            }
        } else {
            this.checkoutDate = tomorrow;
            const dateElement = document.querySelector('#checkoutDate .date-value');
            if (dateElement) {
                dateElement.textContent = tomorrow.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
            }
        }
        
        this.updatePriceBreakdown();
    }

    showGuestSelector() {
        // Create guest selector modal
        const modal = document.createElement('div');
        modal.className = 'guest-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Guests</h3>
                    <button class="close-btn" onclick="this.closest('.guest-modal').remove()">&times;</button>
                </div>
                <div class="guest-selector">
                    <div class="guest-item">
                        <div>
                            <strong>Adults</strong>
                            <p>Ages 13 or above</p>
                        </div>
                        <div class="counter">
                            <button onclick="this.nextElementSibling.textContent = Math.max(1, parseInt(this.nextElementSibling.textContent) - 1)">-</button>
                            <span>${this.guestCount}</span>
                            <button onclick="this.previousElementSibling.textContent = Math.min(8, parseInt(this.previousElementSibling.textContent) + 1)">+</button>
                        </div>
                    </div>
                    <div class="guest-item">
                        <div>
                            <strong>Children</strong>
                            <p>Ages 2-12</p>
                        </div>
                        <div class="counter">
                            <button onclick="this.nextElementSibling.textContent = Math.max(0, parseInt(this.nextElementSibling.textContent) - 1)">-</button>
                            <span>0</span>
                            <button onclick="this.previousElementSibling.textContent = Math.min(5, parseInt(this.previousElementSibling.textContent) + 1)">+</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="hotelDetails.confirmGuestSelection(this.closest('.guest-modal'))">Done</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    confirmGuestSelection(modal) {
        const adults = parseInt(modal.querySelector('.guest-item:first-child .counter span').textContent);
        const children = parseInt(modal.querySelector('.guest-item:last-child .counter span').textContent);
        this.guestCount = adults + children;
        
        const guestElement = document.querySelector('#guestSelector .date-value');
        if (guestElement) {
            guestElement.textContent = `${this.guestCount} guest${this.guestCount > 1 ? 's' : ''}`;
        }
        
        modal.remove();
        this.updatePriceBreakdown();
    }

    updatePriceBreakdown() {
        if (this.checkinDate && this.checkoutDate) {
            const nights = Math.ceil((this.checkoutDate - this.checkinDate) / (1000 * 60 * 60 * 24));
            const subtotal = this.pricePerNight * nights;
            const total = subtotal + this.serviceFee;
            
            const breakdown = document.getElementById('priceBreakdown');
            if (breakdown) {
                breakdown.style.display = 'block';
                breakdown.innerHTML = `
                    <div class="breakdown-item">
                        <span class="breakdown-label">$${this.pricePerNight} x ${nights} nights</span>
                        <span class="breakdown-value">$${subtotal}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Service fee</span>
                        <span class="breakdown-value">$${this.serviceFee}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Total</span>
                        <span class="breakdown-value">$${total}</span>
                    </div>
                `;
                
                // Update reserve button
                const reserveBtn = document.getElementById('reserveBtn');
                if (reserveBtn) {
                    reserveBtn.innerHTML = `Reserve - $${total}`;
                }
            }
        }
    }

    saveProperty() {
        const btn = document.getElementById('saveBtn');
        const originalContent = btn.innerHTML;
        
        btn.innerHTML = '✓ Saved';
        btn.style.borderColor = 'var(--color-spring-green-55)';
        btn.style.color = 'var(--color-spring-green-55)';
        
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.style.borderColor = 'var(--color-grey-91)';
            btn.style.color = 'var(--color-blue-16)';
        }, 2000);
    }

    reserveProperty() {
        const btn = document.getElementById('reserveBtn');
        const originalContent = btn.innerHTML;
        
        btn.innerHTML = '⏳ Processing...';
        btn.disabled = true;
        
        setTimeout(() => {
            // Simulate successful booking
            btn.innerHTML = '✓ Booking Confirmed!';
            btn.style.background = 'var(--color-spring-green-55)';
            
            setTimeout(() => {
                window.location.href = 'hotel-booking.html';
            }, 1000);
        }, 1500);
    }

    viewItinerary(e) {
        const card = e.target.closest('.itinerary-card');
        const title = card.querySelector('h4').textContent;
        
        // Create itinerary preview modal
        const modal = document.createElement('div');
        modal.className = 'itinerary-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-btn" onclick="this.closest('.itinerary-modal').remove()">&times;</button>
                </div>
                <div class="itinerary-preview">
                    <p>This ${title.toLowerCase()} itinerary includes:</p>
                    <ul>
                        <li>🏔️ Scenic gondola rides</li>
                        <li>🚁 Helicopter tours</li>
                        <li>🍷 Wine tasting experiences</li>
                        <li>🥾 Hiking adventures</li>
                    </ul>
                    <div class="itinerary-price">From $299 per person</div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="alert('Redirecting to full itinerary...'); this.closest('.itinerary-modal').remove();">View Full Itinerary</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showAllReviews() {
        // Create reviews modal
        const modal = document.createElement('div');
        modal.className = 'reviews-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>All Reviews (256)</h3>
                    <button class="close-btn" onclick="this.closest('.reviews-modal').remove()">&times;</button>
                </div>
                <div class="all-reviews">
                    <div class="review-filters">
                        <button class="filter-btn active">All</button>
                        <button class="filter-btn">5 Stars</button>
                        <button class="filter-btn">4 Stars</button>
                        <button class="filter-btn">Recent</button>
                    </div>
                    <div class="reviews-list">
                        <!-- Reviews would be loaded here -->
                        <p>Loading all reviews...</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    contactHost() {
        // Create contact modal
        const modal = document.createElement('div');
        modal.className = 'contact-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Contact Zoe Towne</h3>
                    <button class="close-btn" onclick="this.closest('.contact-modal').remove()">&times;</button>
                </div>
                <div class="contact-form">
                    <textarea placeholder="Hi Zoe, I'm interested in your place. Is it available for my dates?"></textarea>
                    <div class="contact-info">
                        <p>📧 Response rate: 100%</p>
                        <p>⏱️ Response time: Within an hour</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="alert('Message sent to Zoe!'); this.closest('.contact-modal').remove();">Send Message</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    viewSimilarHotel(e) {
        const hotelName = e.currentTarget.querySelector('h4').textContent;
        
        // Add loading state
        e.currentTarget.style.opacity = '0.7';
        e.currentTarget.style.pointerEvents = 'none';
        
        setTimeout(() => {
            alert(`Opening ${hotelName} details...`);
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.pointerEvents = 'auto';
        }, 500);
    }

    showLocation() {
        // Create map modal
        const modal = document.createElement('div');
        modal.className = 'map-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Location</h3>
                    <button class="close-btn" onclick="this.closest('.map-modal').remove()">&times;</button>
                </div>
                <div class="map-container">
                    <div class="map-placeholder">
                        <span>🗺️</span>
                        <p>Interactive Map</p>
                        <small>Queenstown Hill, New Zealand</small>
                        <div class="location-details">
                            <p>📍 Exact location provided after booking</p>
                            <p>🚗 15 min to city center</p>
                            <p>✈️ 20 min to airport</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    shareProperty() {
        if (navigator.share) {
            navigator.share({
                title: 'Spectacular views of Queenstown',
                text: 'Check out this amazing place in Queenstown!',
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                // Show success message
                const btn = document.querySelector('[data-action="share"]');
                const originalContent = btn.innerHTML;
                btn.innerHTML = '✓';
                btn.style.borderColor = 'var(--color-spring-green-55)';
                
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.style.borderColor = 'var(--color-grey-91)';
                }, 2000);
            }).catch(() => {
                alert('Unable to share. Please copy the URL manually.');
            });
        }
    }

    toggleFavorite(btn) {
        const isFavorited = btn.classList.contains('favorited');
        
        if (isFavorited) {
            btn.innerHTML = '❤️';
            btn.classList.remove('favorited');
            btn.style.borderColor = 'var(--color-grey-91)';
        } else {
            btn.innerHTML = '💖';
            btn.classList.add('favorited');
            btn.style.borderColor = 'var(--color-spring-green-55)';
        }
    }
}

// Initialize when DOM is loaded
let hotelDetails;
document.addEventListener('DOMContentLoaded', () => {
    hotelDetails = new HotelDetails();
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

// Add modal styles dynamically
const modalStyles = `
<style>
.photo-modal, .guest-modal, .itinerary-modal, .reviews-modal, .contact-modal, .map-modal {
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
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
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
    font-size: 20px;
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

.modal-footer {
    padding: 24px;
    border-top: 1px solid var(--color-grey-91);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.btn-primary {
    background: var(--color-azure-61);
    color: white;
    border: none;
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
}

.photo-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;
}

.photo-grid img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
}

.guest-selector {
    padding: 24px;
}

.guest-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--color-grey-91);
}

.guest-item:last-child {
    border-bottom: none;
}

.counter {
    display: flex;
    align-items: center;
    gap: 16px;
}

.counter button {
    width: 32px;
    height: 32px;
    border: 2px solid var(--color-grey-91);
    border-radius: 50%;
    background: white;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
}

.counter button:hover {
    border-color: var(--color-azure-61);
}

.counter span {
    font-size: 16px;
    font-weight: 600;
    min-width: 20px;
    text-align: center;
}

.itinerary-preview, .all-reviews, .contact-form, .map-container {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;
}

.itinerary-preview ul {
    margin: 16px 0;
    padding-left: 20px;
}

.itinerary-preview li {
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--color-azure-52);
}

.itinerary-price {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-azure-61);
    margin-top: 16px;
}

.contact-form textarea {
    width: 100%;
    height: 120px;
    padding: 16px;
    border: 2px solid var(--color-grey-91);
    border-radius: 8px;
    resize: vertical;
    font-family: 'Poppins', sans-serif;
    margin-bottom: 16px;
}

.contact-info p {
    font-size: 14px;
    color: var(--color-azure-52);
    margin-bottom: 8px;
}

.map-placeholder {
    text-align: center;
    padding: 40px;
    background: var(--color-grey-99);
    border-radius: 12px;
}

.location-details {
    margin-top: 24px;
    text-align: left;
}

.location-details p {
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--color-azure-52);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', modalStyles);