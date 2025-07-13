// Flight Booking JavaScript

// Form validation and interaction
document.addEventListener('DOMContentLoaded', function() {
    initializeBookingForm();
    startSocialProofAnimation();
    initializeFormValidation();
});

// Initialize booking form
function initializeBookingForm() {
    // Set default values
    const today = new Date();
    const departDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    const returnDate = new Date(departDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days later
    
    // Auto-fill email if coming from previous page
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
        document.getElementById('email').value = email;
    }
    
    // Initialize payment form
    initializePaymentForm();
    
    // Add real-time validation
    addRealTimeValidation();
}



// Payment method selection
function selectPaymentMethod(method) {
    const methods = document.querySelectorAll('.payment-method');
    methods.forEach(m => m.classList.remove('active'));
    
    const paymentForms = document.querySelectorAll('.payment-form');
    paymentForms.forEach(form => form.style.display = 'none');
    
    if (method === 'card') {
        methods[0].classList.add('active');
        document.getElementById('cardPaymentForm').style.display = 'block';
    } else if (method === 'paypal') {
        methods[1].classList.add('active');
    } else if (method === 'apple') {
        methods[2].classList.add('active');
    }
}

// Initialize payment form
function initializePaymentForm() {
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');
    
    // Card number formatting
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
            e.target.value = formattedValue;
        });
    }
    
    // Expiry date formatting
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV validation
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
        });
    }
}

// Add real-time validation
function addRealTimeValidation() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styling
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Date of birth validation
    if (field.name === 'dateOfBirth' && value) {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 18 || age > 120) {
            isValid = false;
            errorMessage = 'You must be between 18 and 120 years old';
        }
    }
    
    // Card number validation
    if (field.id === 'cardNumber' && value) {
        const cardNumber = value.replace(/\s/g, '');
        if (cardNumber.length < 13 || cardNumber.length > 19) {
            isValid = false;
            errorMessage = 'Please enter a valid card number';
        }
    }
    
    // CVV validation
    if (field.id === 'cvv' && value) {
        if (value.length < 3 || value.length > 4) {
            isValid = false;
            errorMessage = 'Please enter a valid CVV';
        }
    }
    
    // Show error if invalid
    if (!isValid) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessage;
        errorDiv.style.cssText = `
            color: var(--color-red-55);
            font-size: 12px;
            margin-top: 4px;
            font-weight: 500;
        `;
        field.parentNode.appendChild(errorDiv);
    }
    
    return isValid;
}

// Form validation
function initializeFormValidation() {
    const form = document.querySelector('.booking-form');
    if (!form) return;
    
    // Add error styles to CSS
    const style = document.createElement('style');
    style.textContent = `
        .form-group input.error,
        .form-group select.error {
            border-color: var(--color-red-55);
            box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
        }
    `;
    document.head.appendChild(style);
}

// Edit booking
function editBooking() {
    // In a real implementation, this would allow editing flight selection
    alert('Edit booking functionality would allow you to modify your flight selection.');
}

// Complete booking
function completeBooking() {
    // Validate all required fields
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    let allValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            allValid = false;
        }
    });
    
    // Check terms agreement
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms.checked) {
        allValid = false;
        showNotification('Please agree to the Terms & Conditions to continue.', 'error');
        agreeTerms.focus();
        return;
    }
    
    if (!allValid) {
        showNotification('Please fill in all required fields correctly.', 'error');
        // Scroll to first error
        const firstError = document.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Show loading state
    const bookingBtn = document.querySelector('.complete-booking-btn');
    const originalText = bookingBtn.innerHTML;
    
    bookingBtn.innerHTML = `
        <span class="btn-icon">⏳</span>
        <span class="btn-text">Processing...</span>
        <span class="btn-subtext">Please wait</span>
    `;
    bookingBtn.disabled = true;
    
    // Simulate booking process
    setTimeout(() => {
        // In a real implementation, this would process the payment
        window.location.href = 'booking-confirmation.html?booking=FL123456&total=638';
    }, 3000);
}

// Social proof animation
function startSocialProofAnimation() {
    const notifications = document.querySelectorAll('.booking-notification');
    let currentIndex = 0;
    
    // Hide all notifications initially
    notifications.forEach((notification, index) => {
        notification.style.opacity = index === 0 ? '1' : '0.6';
        notification.style.transform = index === 0 ? 'scale(1)' : 'scale(0.95)';
    });
    
    // Rotate notifications every 4 seconds
    setInterval(() => {
        notifications[currentIndex].style.opacity = '0.6';
        notifications[currentIndex].style.transform = 'scale(0.95)';
        
        currentIndex = (currentIndex + 1) % notifications.length;
        
        notifications[currentIndex].style.opacity = '1';
        notifications[currentIndex].style.transform = 'scale(1)';
    }, 4000);
}

// Show notification
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
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);

// Auto-save form data (optional)
function autoSaveFormData() {
    const formData = {};
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input.type !== 'password' && input.name) {
            formData[input.name] = input.value;
        }
    });
    
    localStorage.setItem('bookingFormData', JSON.stringify(formData));
}

// Load saved form data
function loadSavedFormData() {
    const savedData = localStorage.getItem('bookingFormData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        
        Object.keys(formData).forEach(key => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input && formData[key]) {
                input.value = formData[key];
            }
        });
    }
}

// Update total price
function updateTotal() {
    const baseTotal = 638;
    let addonsTotal = 0;
    
    // Calculate add-ons total
    const checkedAddons = document.querySelectorAll('.addon-option input[type="checkbox"]:checked');
    checkedAddons.forEach(addon => {
        addonsTotal += parseInt(addon.value);
    });
    
    // Update price display
    const addonsItem = document.getElementById('addonsItem');
    const addonsPrice = document.getElementById('addonsPrice');
    const totalPrice = document.getElementById('totalPrice');
    const bookingBtnTotal = document.getElementById('bookingBtnTotal');
    
    if (addonsTotal > 0) {
        addonsItem.style.display = 'flex';
        addonsPrice.textContent = `$${addonsTotal}`;
    } else {
        addonsItem.style.display = 'none';
    }
    
    const newTotal = baseTotal + addonsTotal;
    totalPrice.textContent = `$${newTotal}`;
    bookingBtnTotal.textContent = `$${newTotal} Total`;
}

// Price protection timer
function startPriceTimer() {
    let timeLeft = 15 * 60; // 15 minutes in seconds
    const timerElement = document.getElementById('priceTimer');
    
    const timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            showNotification('Price protection expired. Please refresh to get current pricing.', 'warning');
        }
        
        timeLeft--;
    }, 1000);
}

// Auto-save every 30 seconds
setInterval(autoSaveFormData, 30000);

// Go back to flight details
function goBack() {
    if (confirm('Are you sure you want to go back? Your entered information will be saved.')) {
        autoSaveFormData();
        window.history.back();
    }
}

// Load saved data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSavedFormData();
    startPriceTimer();
    
    // Auto-save form data every 30 seconds
    setInterval(autoSaveFormData, 30000);
});