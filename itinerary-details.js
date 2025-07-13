// Itinerary Details Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // FAQ Accordion Functionality
    initializeFAQ();
    
    // Booking Form Enhancements
    initializeBookingForm();
    
    // Smooth Scrolling
    initializeSmoothScrolling();
    
    // Image Gallery
    initializeGallery();
    
    // Price Animation
    animatePriceOnScroll();
    
    // Form Validation
    initializeFormValidation();
});

// FAQ Accordion
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isActive = this.classList.contains('active');
            
            // Close all other FAQs
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            });
            
            // Toggle current FAQ
            if (!isActive) {
                this.classList.add('active');
                answer.classList.add('active');
            }
        });
    });
}

// Booking Form Enhancements
function initializeBookingForm() {
    const checkInInput = document.querySelector('input[type="date"]:first-of-type');
    const checkOutInput = document.querySelector('input[type="date"]:last-of-type');
    const guestSelect = document.querySelector('select');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    checkInInput.min = today;
    
    // Update checkout minimum when checkin changes
    checkInInput.addEventListener('change', function() {
        const checkInDate = new Date(this.value);
        checkInDate.setDate(checkInDate.getDate() + 1);
        checkOutInput.min = checkInDate.toISOString().split('T')[0];
        
        // Update price calculation
        updatePriceCalculation();
    });
    
    checkOutInput.addEventListener('change', updatePriceCalculation);
    guestSelect.addEventListener('change', updatePriceCalculation);
}

// Price Calculation Update
function updatePriceCalculation() {
    const checkIn = document.querySelector('input[type="date"]:first-of-type').value;
    const checkOut = document.querySelector('input[type="date"]:last-of-type').value;
    const guests = parseInt(document.querySelector('select').value);
    
    if (checkIn && checkOut) {
        const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        const basePrice = 999;
        const totalBase = basePrice * guests;
        const discount = 300;
        const serviceFee = 99;
        const total = totalBase - discount + serviceFee;
        
        // Update price breakdown
        document.querySelector('.breakdown-item:first-child span:last-child').textContent = `$${totalBase}`;
        document.querySelector('.breakdown-total span:last-child').textContent = `$${total}`;
        document.querySelector('.btn-primary-large').textContent = `Book Now - $${total}`;
    }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
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
}

// Image Gallery
function initializeGallery() {
    const galleryBtn = document.querySelector('.gallery-btn');
    const galleryImages = document.querySelectorAll('.gallery-grid img, .main-image img');
    
    galleryBtn.addEventListener('click', function() {
        openLightbox(0);
    });
    
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', function() {
            openLightbox(index);
        });
        img.style.cursor = 'pointer';
    });
}

// Lightbox Gallery
function openLightbox(startIndex) {
    const images = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop'
    ];
    
    let currentIndex = startIndex;
    
    // Create lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev">&#8249;</button>
            <img src="${images[currentIndex]}" alt="Gallery Image">
            <button class="lightbox-next">&#8250;</button>
            <div class="lightbox-counter">${currentIndex + 1} / ${images.length}</div>
        </div>
    `;
    
    // Add lightbox styles
    const style = document.createElement('style');
    style.textContent = `
        .lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
        }
        .lightbox img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        .lightbox-close, .lightbox-prev, .lightbox-next {
            position: absolute;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            font-size: 24px;
            padding: 10px;
            cursor: pointer;
            border-radius: 50%;
        }
        .lightbox-close {
            top: -40px;
            right: -40px;
        }
        .lightbox-prev {
            left: -60px;
            top: 50%;
            transform: translateY(-50%);
        }
        .lightbox-next {
            right: -60px;
            top: 50%;
            transform: translateY(-50%);
        }
        .lightbox-counter {
            position: absolute;
            bottom: -40px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 14px;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(lightbox);
    
    // Event listeners
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
        document.body.removeChild(lightbox);
        document.head.removeChild(style);
    });
    
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    });
    
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        updateLightboxImage();
    });
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            document.body.removeChild(lightbox);
            document.head.removeChild(style);
        }
    });
    
    function updateLightboxImage() {
        lightbox.querySelector('img').src = images[currentIndex];
        lightbox.querySelector('.lightbox-counter').textContent = `${currentIndex + 1} / ${images.length}`;
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (document.body.contains(lightbox)) {
            if (e.key === 'Escape') {
                document.body.removeChild(lightbox);
                document.head.removeChild(style);
            } else if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                updateLightboxImage();
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % images.length;
                updateLightboxImage();
            }
        }
    });
}

// Price Animation on Scroll
function animatePriceOnScroll() {
    const priceElement = document.querySelector('.current-price');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animatePrice(priceElement, 999);
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(priceElement);
}

function animatePrice(element, targetPrice) {
    let currentPrice = 0;
    const increment = targetPrice / 50;
    const timer = setInterval(() => {
        currentPrice += increment;
        if (currentPrice >= targetPrice) {
            currentPrice = targetPrice;
            clearInterval(timer);
        }
        element.textContent = `$${Math.floor(currentPrice)}`;
    }, 20);
}

// Form Validation
function initializeFormValidation() {
    const reserveBtn = document.querySelector('.btn-primary');
    const bookNowBtn = document.querySelector('.btn-primary-large');
    
    [reserveBtn, bookNowBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const checkIn = document.querySelector('input[type="date"]:first-of-type').value;
                const checkOut = document.querySelector('input[type="date"]:last-of-type').value;
                
                if (!checkIn || !checkOut) {
                    showNotification('Please select your travel dates', 'error');
                    return;
                }
                
                if (new Date(checkIn) >= new Date(checkOut)) {
                    showNotification('Check-out date must be after check-in date', 'error');
                    return;
                }
                
                // Simulate booking process
                showBookingModal();
            });
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        }
        .notification-error {
            background: #EF4444;
        }
        .notification-success {
            background: #10B981;
        }
        .notification-info {
            background: #3B82F6;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
            document.head.removeChild(style);
        }
    }, 3000);
}

// Booking Modal
function showBookingModal() {
    const modal = document.createElement('div');
    modal.className = 'booking-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Confirm Your Booking</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="booking-summary">
                    <h4>Queenstown Adventure Package</h4>
                    <p>7 days of unforgettable experiences</p>
                    <div class="summary-details">
                        <div class="detail-row">
                            <span>Dates:</span>
                            <span>${document.querySelector('input[type="date"]:first-of-type').value} - ${document.querySelector('input[type="date"]:last-of-type').value}</span>
                        </div>
                        <div class="detail-row">
                            <span>Guests:</span>
                            <span>${document.querySelector('select').value}</span>
                        </div>
                        <div class="detail-row total">
                            <span>Total:</span>
                            <span>$1,797</span>
                        </div>
                    </div>
                </div>
                <div class="payment-form">
                    <h4>Payment Information</h4>
                    <input type="email" placeholder="Email address" required>
                    <input type="text" placeholder="Full name" required>
                    <input type="tel" placeholder="Phone number" required>
                    <div class="card-inputs">
                        <input type="text" placeholder="Card number" required>
                        <input type="text" placeholder="MM/YY" required>
                        <input type="text" placeholder="CVC" required>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary modal-cancel">Cancel</button>
                <button class="btn-primary confirm-booking">Confirm Booking</button>
            </div>
        </div>
    `;
    
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        .booking-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal-content {
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px;
            border-bottom: 1px solid #E6E8EC;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
        }
        .modal-body {
            padding: 24px;
        }
        .booking-summary {
            margin-bottom: 24px;
            padding: 16px;
            background: #F4F5F6;
            border-radius: 12px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .detail-row.total {
            font-weight: 700;
            border-top: 1px solid #E6E8EC;
            padding-top: 8px;
        }
        .payment-form input {
            width: 100%;
            padding: 12px;
            margin-bottom: 16px;
            border: 1px solid #E6E8EC;
            border-radius: 8px;
        }
        .card-inputs {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 12px;
        }
        .modal-footer {
            display: flex;
            gap: 12px;
            padding: 24px;
            border-top: 1px solid #E6E8EC;
        }
        .confirm-booking {
            flex: 1;
        }
    `;
    
    document.head.appendChild(modalStyle);
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    modal.querySelector('.confirm-booking').addEventListener('click', function() {
        // Simulate booking confirmation
        closeModal();
        showNotification('Booking confirmed! Check your email for details.', 'success');
    });
    
    function closeModal() {
        document.body.removeChild(modal);
        document.head.removeChild(modalStyle);
    }
}

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate elements on scroll
document.querySelectorAll('.timeline-item, .benefit-card, .review-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Sticky booking card behavior
window.addEventListener('scroll', function() {
    const bookingCard = document.querySelector('.booking-card');
    const footer = document.querySelector('.cta-section');
    
    if (bookingCard && footer) {
        const footerTop = footer.offsetTop;
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        if (scrollTop + windowHeight > footerTop) {
            bookingCard.style.position = 'absolute';
            bookingCard.style.bottom = '24px';
        } else {
            bookingCard.style.position = 'sticky';
            bookingCard.style.bottom = 'auto';
        }
    }
});