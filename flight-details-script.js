// Flight Details Page JavaScript
console.log('Flight details script loaded');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupInteractions();
});

// Initialize page functionality
function initializePage() {
    // Initialize booking options
    initializeBookingOptions();
    
    // Set default selection
    document.getElementById('flight-only').checked = true;
    document.querySelector('#flight-only').closest('.option').classList.add('selected');
    
    // Initialize price calculation
    updateTotalPrice();
    
    // Initialize mobile booking
    initializeMobileBooking();
    
    // Initialize trust signals animation
    animateTrustSignals();
}

// Setup interactive elements
function setupInteractions() {
    // Add hover effects to option cards
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-4px)';
        });
    });
    
    // Add click tracking for analytics
    setupAnalytics();
}

// Setup option card functionality
function setupOptionCards() {
    const optionCards = document.querySelectorAll('.option-card');
    
    optionCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active state from all cards
            optionCards.forEach(c => c.classList.remove('selected'));
            
            // Add active state to clicked card
            this.classList.add('selected');
            
            // Update CTA button based on selection
            updateCTAButton(this);
        });
    });
}

// Select booking option
function selectBookingOption(optionType) {
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    
    const selectedOption = document.querySelector(`#${optionType === 'flight' ? 'flight-only' : 'flight-hotel'}`).closest('.option');
    selectedOption.classList.add('selected');
    
    // Update book button
    const bookBtn = document.querySelector('.book-btn');
    const prices = {
        'flight': '$599',
        'package': '$899'
    };
    
    bookBtn.innerHTML = `
        <span>Book ${optionType === 'flight' ? 'Flight' : 'Package'} - ${prices[optionType]}</span>
        <span class="book-subtext">Secure checkout in 2 minutes</span>
    `;
}

// Proceed to booking
function proceedToBooking() {
    const selectedOption = document.querySelector('.option.selected');
    let bookingType = 'flight-only';
    let price = '$599';
    
    if (selectedOption && selectedOption.querySelector('#flight-hotel')) {
        bookingType = 'flight-hotel';
        price = '$899';
    }
    
    alert(`Proceeding to secure checkout\n\nBooking: ${bookingType}\nPrice: ${price}\n\nIn a real implementation, this would redirect to the payment page.`);
}

// Show booking confirmation
function showBookingConfirmation(option) {
    const confirmation = `
        🎉 Great Choice!
        
        Selected: ${option.title}
        Price: ${option.price}
        
        ${option.description}
        
        Ready to proceed to secure checkout?
    `;
    
    if (confirm(confirmation)) {
        proceedToBooking(option);
    }
}

// Proceed to booking
function proceedToBooking(option) {
    // In real implementation, this would redirect to checkout
    alert(`Proceeding to secure checkout for ${option.title}\n\nIn a real implementation, this would redirect to the booking/payment page.`);
    
    // Track conversion event
    trackEvent('booking_initiated', {
        option_type: option.title,
        price: option.price
    });
}

// Initialize booking options
function initializeBookingOptions() {
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Update selection
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            updateTotalPrice();
        });
    });
    
    // Initialize add-on checkboxes
    const addons = document.querySelectorAll('.addon-item input');
    addons.forEach(addon => {
        addon.addEventListener('change', updateTotalPrice);
    });
}

// Update total price
function updateTotalPrice() {
    let basePrice = 599;
    let addonsPrice = 0;
    let addonsText = [];
    
    // Check if package is selected
    const packageSelected = document.getElementById('flight-hotel').checked;
    if (packageSelected) {
        basePrice = 899;
    }
    
    // Check add-ons
    if (document.getElementById('seat-upgrade')?.checked) {
        addonsPrice += 49;
        addonsText.push('Premium seat: +$49');
    }
    
    if (document.getElementById('travel-insurance')?.checked) {
        addonsPrice += 29;
        addonsText.push('Travel insurance: +$29');
    }
    
    const total = basePrice + addonsPrice;
    
    // Update price display
    const priceBreakdown = document.querySelector('.price-breakdown');
    const finalTotal = document.querySelector('.final-total');
    const bookBtn = document.querySelector('.book-btn');
    
    if (priceBreakdown) {
        priceBreakdown.innerHTML = `
            <span>${packageSelected ? 'Flight + Hotel' : 'Flight'}: $${basePrice}</span>
            ${addonsText.map(text => `<span>${text}</span>`).join('')}
        `;
    }
    
    if (finalTotal) {
        finalTotal.textContent = `Total: $${total}`;
    }
    
    if (bookBtn) {
        bookBtn.innerHTML = `
            <span>Book ${packageSelected ? 'Package' : 'Flight'} - $${total}</span>
            <span class="book-subtext">Secure checkout in 2 minutes</span>
        `;
    }
}

// Show seat map
function showSeatMap() {
    document.getElementById('seatModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close seat modal
function closeSeatModal() {
    document.getElementById('seatModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset selection
    const selectedSeats = document.querySelectorAll('.seat.selected');
    selectedSeats.forEach(seat => {
        seat.classList.remove('selected');
    });
    
    document.getElementById('selectedSeatInfo').style.display = 'none';
    document.getElementById('confirmSeatBtn').disabled = true;
}

// Select seat
function selectSeat(seatNumber) {
    const seatElement = document.querySelector(`[data-seat="${seatNumber}"]`);
    
    // Check if seat is available
    if (seatElement.classList.contains('occupied')) {
        return;
    }
    
    // Remove previous selection
    const previousSelected = document.querySelector('.seat.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }
    
    // Select new seat
    seatElement.classList.add('selected');
    
    // Update seat info
    updateSelectedSeatInfo(seatNumber, seatElement);
    
    // Enable confirm button
    document.getElementById('confirmSeatBtn').disabled = false;
}

// Update selected seat info
function updateSelectedSeatInfo(seatNumber, seatElement) {
    const seatInfo = document.getElementById('selectedSeatInfo');
    const seatNumberEl = document.getElementById('selectedSeatNumber');
    const seatTypeEl = document.getElementById('selectedSeatType');
    const seatPriceEl = document.getElementById('selectedSeatPrice');
    
    seatNumberEl.textContent = seatNumber;
    
    if (seatElement.classList.contains('premium')) {
        seatTypeEl.textContent = 'Business Class';
        seatPriceEl.textContent = '+$49';
        seatPriceEl.style.color = 'var(--color-orange-70)';
    } else {
        seatTypeEl.textContent = 'Economy Class';
        seatPriceEl.textContent = 'Included';
        seatPriceEl.style.color = 'var(--color-spring-green-55)';
    }
    
    // Determine seat position
    const seatLetter = seatNumber.slice(-1);
    let position = '';
    if (['A', 'F'].includes(seatLetter)) {
        position = ' • Window';
    } else if (['C', 'D'].includes(seatLetter)) {
        position = ' • Aisle';
    } else {
        position = ' • Middle';
    }
    
    seatTypeEl.textContent += position;
    
    seatInfo.style.display = 'block';
}

// Confirm seat selection
function confirmSeatSelection() {
    const selectedSeat = document.querySelector('.seat.selected');
    if (!selectedSeat) return;
    
    const seatNumber = selectedSeat.getAttribute('data-seat');
    const isPremium = selectedSeat.classList.contains('premium');
    
    // Update the main page
    const amenityText = document.querySelector('.amenity.clickable');
    amenityText.innerHTML = `💺 Seat ${seatNumber} Selected`;
    amenityText.style.color = 'var(--color-spring-green-55)';
    
    // Update add-ons if premium seat
    if (isPremium) {
        const seatUpgrade = document.getElementById('seat-upgrade');
        if (seatUpgrade) {
            seatUpgrade.checked = true;
            updateTotalPrice();
        }
    }
    
    // Show success message
    showNotification(`Seat ${seatNumber} selected successfully! 💺`, 'success');
    
    // Close modal
    closeSeatModal();
}

// Show notification (enhanced)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: '#58C27D',
        error: '#e74c3c',
        info: '#3B71FE',
        warning: '#FFD166'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        font-family: 'DM Sans', sans-serif;
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        z-index: 10001;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// View itinerary
function viewItinerary(itineraryId) {
    // Navigate to itinerary details page with the specific itinerary ID
    window.location.href = `itinerary-details.html?id=${itineraryId}&from=flight-details`;
}

// View all itineraries
function viewAllItineraries() {
    alert('🗺️ All Paris Itineraries\n\nExplore 15+ curated Paris experiences:\n\n• Art & Museums (3-7 days)\n• Family Fun (4-6 days)\n• Luxury Experience (5-10 days)\n• Budget Explorer (3-5 days)\n• Photography Tour (2-4 days)\n\nIn a real implementation, this would navigate to the itineraries page.');
}

// Show flight tab
function showFlightTab(tabType) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide flight details
    const outboundFlight = document.getElementById('outboundFlight');
    const returnFlight = document.getElementById('returnFlight');
    
    if (tabType === 'outbound') {
        outboundFlight.style.display = 'flex';
        returnFlight.style.display = 'none';
    } else {
        outboundFlight.style.display = 'none';
        returnFlight.style.display = 'flex';
    }
}

// Enhanced show seat map with flight type
function showSeatMap(flightType = 'outbound') {
    document.getElementById('seatModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Update modal title based on flight type
    const modalTitle = document.querySelector('.modal-header h3');
    if (flightType === 'return') {
        modalTitle.textContent = 'Choose Your Return Seat';
        
        // Update flight info in modal
        const flightInfoMini = document.querySelector('.flight-info-mini');
        flightInfoMini.innerHTML = `
            <span>Paris → NYC</span>
            <span>DL 1235 • Boeing 777</span>
            <span>Dec 22 • 3:15 PM</span>
        `;
    } else {
        modalTitle.textContent = 'Choose Your Seat';
        
        // Reset to outbound info
        const flightInfoMini = document.querySelector('.flight-info-mini');
        flightInfoMini.innerHTML = `
            <span>NYC → Paris</span>
            <span>DL 1234 • Boeing 777</span>
            <span>Dec 15 • 8:30 AM</span>
        `;
    }
}

// Initialize mobile booking summary
function initializeMobileBooking() {
    // Show mobile summary on mobile devices
    if (window.innerWidth <= 768) {
        const mobileSummary = document.getElementById('mobileSummary');
        if (mobileSummary) {
            mobileSummary.style.display = 'block';
        }
        
        // Add padding to body to account for fixed summary
        document.body.style.paddingBottom = '80px';
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const mobileSummary = document.getElementById('mobileSummary');
        if (window.innerWidth <= 768) {
            if (mobileSummary) mobileSummary.style.display = 'block';
            document.body.style.paddingBottom = '80px';
        } else {
            if (mobileSummary) mobileSummary.style.display = 'none';
            document.body.style.paddingBottom = '0';
        }
    });
}

// Save for later function
function saveForLater() {
    // Save flight details to localStorage or user account
    const flightData = {
        route: 'NYC → Paris',
        date: 'Dec 15, 2024',
        price: '$599',
        airline: 'Delta Airlines',
        flightNumber: 'DL 1234',
        savedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    let savedFlights = JSON.parse(localStorage.getItem('savedFlights') || '[]');
    savedFlights.push(flightData);
    localStorage.setItem('savedFlights', JSON.stringify(savedFlights));
    
    // Show confirmation
    showNotification('Flight saved to your wishlist! 💾', 'success');
    
    // Track save event
    trackEvent('flight_saved', flightData);
}

// Update CTA button based on selection
function updateCTAButton(selectedCard) {
    const ctaButton = document.querySelector('.cta-primary');
    const optionTitle = selectedCard.querySelector('h3').textContent;
    const optionPrice = selectedCard.querySelector('.option-price').textContent.split(' ')[0];
    
    if (ctaButton) {
        ctaButton.innerHTML = `
            <span>Book ${optionTitle} - ${optionPrice}</span>
            <span class="cta-subtext">Secure booking in 2 minutes</span>
        `;
    }
}

// Animate trust signals
function animateTrustSignals() {
    const trustItems = document.querySelectorAll('.trust-item');
    
    // Animate trust signals on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    trustItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });
}

// Setup analytics tracking
function setupAnalytics() {
    // Track page view
    trackEvent('flight_details_viewed', {
        route: 'NYC → Paris',
        flight: 'DL 1234',
        price: '$599'
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            // Track milestone scrolls
            if (maxScroll >= 25 && maxScroll < 50) {
                trackEvent('scroll_25_percent');
            } else if (maxScroll >= 50 && maxScroll < 75) {
                trackEvent('scroll_50_percent');
            } else if (maxScroll >= 75) {
                trackEvent('scroll_75_percent');
            }
        }
    });
}

// Track events (placeholder for analytics)
function trackEvent(eventName, eventData = {}) {
    console.log(`Analytics Event: ${eventName}`, eventData);
    
    // In real implementation, this would send to analytics service
    // Example: gtag('event', eventName, eventData);
    // Example: analytics.track(eventName, eventData);
}



// Handle option card selection with visual feedback
function handleOptionSelection(card) {
    // Remove selection from all cards
    document.querySelectorAll('.option-card').forEach(c => {
        c.classList.remove('selected');
        c.style.borderColor = '';
    });
    
    // Add selection to clicked card
    card.classList.add('selected');
    card.style.borderColor = '#3B71FE';
    
    // Add pulse animation
    card.style.animation = 'pulse 0.3s ease';
    setTimeout(() => {
        card.style.animation = '';
    }, 300);
}

// Price comparison functionality
function showPriceComparison() {
    const comparisonData = {
        'TravelAI': '$599',
        'Competitor A': '$649',
        'Competitor B': '$679',
        'Competitor C': '$625'
    };
    
    let comparisonText = 'Price Comparison:\n\n';
    Object.entries(comparisonData).forEach(([site, price]) => {
        comparisonText += `${site}: ${price}\n`;
    });
    comparisonText += '\n✅ You\'re getting the best deal with TravelAI!';
    
    alert(comparisonText);
}

// Weather information for destination
function showWeatherDetails() {
    const weatherInfo = {
        current: '18°C, Partly Cloudy',
        forecast: [
            'Tomorrow: 20°C, Sunny',
            'Day 2: 16°C, Light Rain',
            'Day 3: 22°C, Sunny',
            'Day 4: 19°C, Cloudy',
            'Day 5: 21°C, Partly Cloudy'
        ]
    };
    
    let weatherText = `Paris Weather Forecast:\n\nCurrent: ${weatherInfo.current}\n\n`;
    weatherInfo.forecast.forEach(day => {
        weatherText += `${day}\n`;
    });
    
    alert(weatherText);
}

// Add CSS animations
const animationStyles = `
<style>
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.02);
    }
    100% {
        transform: scale(1);
    }
}

.option-card.selected {
    border-color: #3B71FE !important;
    box-shadow: 0 8px 24px rgba(59, 113, 254, 0.2) !important;
}

.option-card.selected .select-btn {
    background: #3B71FE !important;
    border-color: #3B71FE !important;
    color: white !important;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', animationStyles);