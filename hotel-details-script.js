// Hotel Details JavaScript - Complete Functionality

// Gallery images
const galleryImages = [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'
];

let currentImageIndex = 0;
let selectedBookingOption = 'hotel';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateImageCounter();
    updatePricing();
    initializeMobileBookingBar();
});

// Gallery Functions
function changeImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = galleryImages.length - 1;
    if (currentImageIndex >= galleryImages.length) currentImageIndex = 0;
    updateMainImage();
}

function selectImage(index) {
    currentImageIndex = index;
    updateMainImage();
}

function updateMainImage() {
    document.getElementById('mainImage').src = galleryImages[currentImageIndex];
    document.getElementById('currentImg').textContent = currentImageIndex + 1;
    
    // Update thumbnails
    document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });
}

function updateImageCounter() {
    document.getElementById('totalImg').textContent = galleryImages.length;
}

// Tab Functions
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName).style.display = 'block';
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Room Selection
function selectRoom(roomType) {
    const prices = {
        'deluxe': 245,
        'suite': 395
    };
    
    const selectedPrice = prices[roomType];
    const nights = 3;
    const total = selectedPrice * nights;
    
    // Update pricing display
    document.querySelector('.current-price').textContent = `$${selectedPrice}`;
    document.querySelector('.final-total').textContent = `Total: $${total}`;
    document.querySelector('.book-btn span').textContent = `Book Hotel - $${total}`;
    
    // Update mobile bar
    document.querySelector('.mobile-total').textContent = `$${selectedPrice}`;
    
    // Show confirmation
    showNotification(`${roomType === 'deluxe' ? 'Deluxe Room' : 'Executive Suite'} selected!`);
}

// Booking Options
function selectOption(option) {
    selectedBookingOption = option;
    
    // Update radio buttons
    document.querySelectorAll('input[name="booking"]').forEach(radio => {
        radio.checked = false;
    });
    
    if (option === 'hotel') {
        document.getElementById('hotel-only').checked = true;
    } else {
        document.getElementById('hotel-itinerary').checked = true;
    }
    
    updatePricing();
}

function updatePricing() {
    const basePrice = 245;
    const nights = 3;
    const hotelTotal = basePrice * nights;
    const itineraryPrice = 89;
    
    const priceBreakdown = document.querySelector('.price-breakdown');
    const finalTotal = document.querySelector('.final-total');
    const bookBtn = document.querySelector('.book-btn span');
    const packageAdd = document.getElementById('packageAdd');
    
    if (selectedBookingOption === 'package') {
        const total = hotelTotal + itineraryPrice;
        packageAdd.textContent = `Paris Tour: +$${itineraryPrice}`;
        finalTotal.textContent = `Total: $${total}`;
        bookBtn.textContent = `Book Package - $${total}`;
    } else {
        packageAdd.textContent = '';
        finalTotal.textContent = `Total: $${hotelTotal}`;
        bookBtn.textContent = `Book Hotel - $${hotelTotal}`;
    }
}

// Booking Process
function proceedToBooking() {
    const btn = document.querySelector('.book-btn');
    const originalContent = btn.innerHTML;
    
    btn.innerHTML = '<span>⏳ Processing...</span>';
    btn.disabled = true;
    
    setTimeout(() => {
        if (selectedBookingOption === 'package') {
            window.location.href = 'hotel-booking.html?hotel=hotel-le-grand-paris&package=paris-classic';
        } else {
            window.location.href = 'hotel-booking.html?hotel=hotel-le-grand-paris';
        }
    }, 1500);
}

// Itinerary Functions
function addItinerary(type) {
    selectedBookingOption = 'package';
    document.getElementById('hotel-itinerary').checked = true;
    updatePricing();
    
    // Scroll to booking panel
    document.querySelector('.booking-panel').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
    
    showNotification(`${type === 'classic' ? 'Paris Classic' : 'Paris Foodie'} itinerary added!`);
}

// Mobile Booking Bar
function initializeMobileBookingBar() {
    const mobileBar = document.getElementById('mobileBookingBar');
    const bookingPanel = document.querySelector('.booking-panel');
    
    // Show/hide mobile bar based on booking panel visibility
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (window.innerWidth <= 1024) {
                mobileBar.style.display = entry.isIntersecting ? 'none' : 'flex';
            } else {
                mobileBar.style.display = 'none';
            }
        });
    });
    
    observer.observe(bookingPanel);
}

// Utility Functions
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--color-spring-green-55);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

// Handle window resize
window.addEventListener('resize', () => {
    initializeMobileBookingBar();
});

// Smooth scrolling for anchor links
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

// Form validation
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('change', function() {
        if (this.value) {
            this.style.borderColor = 'var(--color-spring-green-55)';
        } else {
            this.style.borderColor = 'var(--color-grey-91)';
        }
    });
});

// Social proof simulation
function startSocialProof() {
    const messages = [
        'Sarah M. just booked this hotel',
        'James R. is viewing this hotel',
        'Emma L. just added Paris Classic tour',
        'Carlos D. just booked the Executive Suite'
    ];
    
    let index = 0;
    setInterval(() => {
        // Could add floating notifications here
        index = (index + 1) % messages.length;
    }, 8000);
}

// Start social proof after page load
setTimeout(startSocialProof, 3000);