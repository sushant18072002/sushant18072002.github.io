// Itinerary Booking JavaScript - Matching Flight/Hotel Booking Pattern
class ItineraryBooking {
    constructor() {
        this.basePrice = 999;
        this.travelers = 2;
        this.serviceFee = 99;
        this.discount = 300;
        this.addons = 0;
        this.priceTimer = 15 * 60; // 15 minutes in seconds
        this.bindEvents();
        this.startPriceTimer();
        this.updateTotal();
    }

    bindEvents() {
        // Payment method selection
        document.querySelectorAll('.payment-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.selectPaymentMethod(e));
        });

        // Add-on checkboxes
        document.querySelectorAll('.addon-option input').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateTotal());
        });

        // Form submission
        const form = document.querySelector('.booking-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Complete booking button
        const completeBtn = document.getElementById('completeBookingBtn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.completeBooking());
        }

        // Back button
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }

        // Edit button
        const editBtn = document.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editBooking());
        }
    }

    selectPaymentMethod(e) {
        const clickedTab = e.currentTarget;
        const method = clickedTab.textContent.includes('Card') ? 'card' : 'paypal';
        
        // Remove active class from all tabs
        document.querySelectorAll('.payment-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to clicked tab
        clickedTab.classList.add('active');
        
        // Show/hide payment forms
        const cardForm = document.getElementById('cardPaymentForm');
        if (cardForm) {
            cardForm.style.display = method === 'card' ? 'block' : 'none';
        }
        
        console.log('Payment method selected:', method);
    }

    updateTotal() {
        // Calculate add-ons
        this.addons = 0;
        document.querySelectorAll('.addon-option input:checked').forEach(checkbox => {
            this.addons += parseInt(checkbox.value) || 0;
        });

        // Calculate totals
        const subtotal = this.basePrice * this.travelers;
        const total = subtotal + this.serviceFee - this.discount + this.addons;

        // Update price breakdown
        const addonsItem = document.getElementById('addonsItem');
        const addonsPrice = document.getElementById('addonsPrice');
        const totalPrice = document.getElementById('totalPrice');
        const bookingBtnTotal = document.getElementById('bookingBtnTotal');

        if (this.addons > 0) {
            addonsItem.style.display = 'flex';
            addonsPrice.textContent = `$${this.addons}`;
        } else {
            addonsItem.style.display = 'none';
        }

        totalPrice.textContent = `$${total.toLocaleString()}`;
        bookingBtnTotal.textContent = `$${total.toLocaleString()} Total`;
    }

    startPriceTimer() {
        const timerElement = document.getElementById('priceTimer');
        if (!timerElement) return;

        const updateTimer = () => {
            const minutes = Math.floor(this.priceTimer / 60);
            const seconds = this.priceTimer % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.priceTimer > 0) {
                this.priceTimer--;
                setTimeout(updateTimer, 1000);
            } else {
                timerElement.textContent = 'Expired';
                timerElement.style.color = 'var(--color-orange-70)';
            }
        };

        updateTimer();
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        // Basic validation
        const requiredFields = document.querySelectorAll('input[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = 'var(--color-orange-70)';
                isValid = false;
            } else {
                field.style.borderColor = 'var(--color-grey-91)';
            }
        });

        // Check terms agreement
        const termsCheckbox = document.getElementById('agreeTerms');
        if (!termsCheckbox.checked) {
            alert('Please agree to the Terms & Conditions to continue.');
            return;
        }

        if (!isValid) {
            alert('Please fill in all required fields.');
            return;
        }

        this.completeBooking();
    }

    completeBooking() {
        const completeBtn = document.getElementById('completeBookingBtn');
        const originalContent = completeBtn.innerHTML;
        
        // Show loading state
        completeBtn.innerHTML = `
            <span class="btn-icon">⏳</span>
            <span class="btn-text">Processing Booking...</span>
            <span class="btn-subtext">Please wait</span>
        `;
        completeBtn.disabled = true;
        
        // Simulate booking process
        setTimeout(() => {
            completeBtn.innerHTML = `
                <span class="btn-icon">✅</span>
                <span class="btn-text">Booking Confirmed!</span>
                <span class="btn-subtext">Redirecting...</span>
            `;
            completeBtn.style.background = 'var(--color-spring-green-55)';
            
            setTimeout(() => {
                // Redirect to confirmation page
                window.location.href = 'booking-confirmation.html?type=itinerary&id=queenstown-adventure';
            }, 1500);
        }, 2000);
    }

    goBack() {
        if (confirm('Are you sure you want to go back? Your progress will be lost.')) {
            window.history.back();
        }
    }

    editBooking() {
        // Scroll to top of form
        document.querySelector('.booking-form').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Highlight the form briefly
        const form = document.querySelector('.booking-form');
        form.style.boxShadow = '0 0 0 3px rgba(59, 113, 254, 0.3)';
        setTimeout(() => {
            form.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
        }, 2000);
    }
}

// Global functions for onclick handlers
function selectPaymentMethod(method) {
    console.log('Payment method:', method);
}

function updateTotal() {
    if (window.itineraryBooking) {
        window.itineraryBooking.updateTotal();
    }
}

function completeBooking() {
    if (window.itineraryBooking) {
        window.itineraryBooking.completeBooking();
    }
}

function goBack() {
    if (window.itineraryBooking) {
        window.itineraryBooking.goBack();
    }
}

function editBooking() {
    if (window.itineraryBooking) {
        window.itineraryBooking.editBooking();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.itineraryBooking = new ItineraryBooking();
    
    // Get URL parameters for dates and travelers
    const urlParams = new URLSearchParams(window.location.search);
    const startDate = urlParams.get('start');
    const endDate = urlParams.get('end');
    const travelers = urlParams.get('travelers') || '2';
    
    // Update booking details if parameters exist
    if (startDate && endDate) {
        const start = new Date(startDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        const end = new Date(endDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        // Update date display
        const dateElements = document.querySelectorAll('.itinerary-details span');
        dateElements.forEach(el => {
            if (el.textContent.includes('May')) {
                el.textContent = `📅 ${start}-${end}`;
            }
        });
    }
    
    // Update traveler count
    if (travelers) {
        window.itineraryBooking.travelers = parseInt(travelers);
        const travelerElements = document.querySelectorAll('.itinerary-details span');
        travelerElements.forEach(el => {
            if (el.textContent.includes('adults')) {
                el.textContent = `👥 ${travelers} adult${travelers > 1 ? 's' : ''}`;
            }
        });
        window.itineraryBooking.updateTotal();
    }
});

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Auto-format card number
document.addEventListener('DOMContentLoaded', () => {
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Auto-format expiry date
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
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