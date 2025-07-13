// Hotel Booking JavaScript
class HotelBooking {
    constructor() {
        this.bookingData = {
            guest: {},
            payment: {},
            requests: ''
        };
        this.bindEvents();
        this.loadBookingData();
    }

    bindEvents() {
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => this.selectPaymentMethod(e));
        });

        // Form validation
        document.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e));
            input.addEventListener('input', (e) => this.clearValidation(e));
        });

        // Form submission
        const bookBtn = document.querySelector('.book-btn');
        if (bookBtn) {
            bookBtn.addEventListener('click', () => this.completeBooking());
        }

        // Auto-format inputs
        this.setupInputFormatting();
    }

    selectPaymentMethod(e) {
        const method = e.currentTarget;
        
        // Remove active class from all methods
        document.querySelectorAll('.payment-method').forEach(m => {
            m.classList.remove('active');
        });
        
        // Add active class to selected method
        method.classList.add('active');
        
        // Store selection
        this.bookingData.payment.method = method.querySelector('span:last-child').textContent;
    }

    validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        
        if (!value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        // Email validation
        if (field.type === 'email' && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        // Phone validation
        if (field.type === 'tel' && !this.isValidPhone(value)) {
            this.showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        field.style.borderColor = '#EF4444';
        field.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #EF4444;
            font-size: 12px;
            margin-top: 4px;
            font-family: 'DM Sans', sans-serif;
        `;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        field.style.boxShadow = '';
        
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    clearValidation(e) {
        this.clearFieldError(e.target);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
    }

    setupInputFormatting() {
        // Card number formatting
        const cardInput = document.querySelector('input[placeholder*="1234"]');
        if (cardInput) {
            cardInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }

        // Expiry date formatting
        const expiryInput = document.querySelector('input[placeholder="MM/YY"]');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // CVV formatting
        const cvvInput = document.querySelector('input[placeholder="123"]');
        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
            });
        }

        // Phone formatting
        const phoneInput = document.querySelector('input[type="tel"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 0) {
                    if (value.length <= 3) {
                        value = `(${value}`;
                    } else if (value.length <= 6) {
                        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                    } else {
                        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                    }
                }
                e.target.value = value;
            });
        }
    }

    validateForm() {
        const requiredFields = document.querySelectorAll('input[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField({ target: field })) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    completeBooking() {
        if (!this.validateForm()) {
            this.showNotification('Please fill in all required fields correctly', 'error');
            return;
        }

        const bookBtn = document.querySelector('.book-btn');
        const originalText = bookBtn.textContent;
        
        // Show loading state
        bookBtn.textContent = '⏳ Processing...';
        bookBtn.disabled = true;
        
        // Simulate booking process
        setTimeout(() => {
            this.showNotification('🎉 Booking confirmed! Redirecting...', 'success');
            
            setTimeout(() => {
                // In a real app, this would redirect to confirmation page
                window.location.href = 'hotel-confirmation.html';
            }, 1500);
        }, 2000);
    }

    showNotification(message, type = 'success') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style notification
        notification.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            font-family: 'DM Sans', sans-serif;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: #58C27D; color: white;' : 'background: #EF4444; color: white;'}
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Hide notification
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    loadBookingData() {
        // In a real app, this would load data from URL params or session storage
        const urlParams = new URLSearchParams(window.location.search);
        const hotelName = urlParams.get('hotel');
        
        if (hotelName) {
            // Update hotel name in summary
            const hotelNameElement = document.querySelector('.hotel-info h4');
            if (hotelNameElement) {
                hotelNameElement.textContent = decodeURIComponent(hotelName);
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hotelBooking = new HotelBooking();
});

// Global function for onclick handlers
function completeBooking() {
    if (window.hotelBooking) {
        window.hotelBooking.completeBooking();
    }
}