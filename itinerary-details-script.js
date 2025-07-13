// Enhanced Itinerary Details Script
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    loadDynamicContent();
});

// Initialize page functionality
function initializePage() {
    // Set default dates
    const checkinDate = document.querySelector('input[type="date"]');
    const checkoutDate = document.querySelectorAll('input[type="date"]')[1];
    
    if (checkinDate && checkoutDate) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        checkinDate.value = today.toISOString().split('T')[0];
        checkoutDate.value = tomorrow.toISOString().split('T')[0];
    }
    
    // Initialize gallery
    setupImageGallery();
    
    // Setup sticky booking card
    setupStickyBooking();
}

// Setup event listeners
function setupEventListeners() {
    // Date change listeners
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.addEventListener('change', calculatePricing);
    });
    
    // Guest count change
    const guestSelect = document.querySelector('select');
    if (guestSelect) {
        guestSelect.addEventListener('change', calculatePricing);
    }
    
    // Scroll effects
    window.addEventListener('scroll', handleScroll);
    
    // Review interactions
    setupReviewInteractions();
}

// Toggle day details in itinerary
function toggleDay(dayNumber) {
    const timelineItem = document.querySelector(`.timeline-item:nth-child(${dayNumber})`);
    const dayDetails = document.getElementById(`day-${dayNumber}`);
    
    if (timelineItem && dayDetails) {
        timelineItem.classList.toggle('active');
        
        if (timelineItem.classList.contains('active')) {
            dayDetails.style.display = 'block';
            // Smooth animation
            dayDetails.style.opacity = '0';
            dayDetails.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                dayDetails.style.transition = 'all 0.3s ease';
                dayDetails.style.opacity = '1';
                dayDetails.style.transform = 'translateY(0)';
            }, 10);
        } else {
            dayDetails.style.display = 'none';
        }
    }
}

// Image gallery functionality
function setupImageGallery() {
    const mainImage = document.querySelector('.main-image img');
    const sideImages = document.querySelectorAll('.side-images img');
    
    sideImages.forEach(img => {
        img.addEventListener('click', () => {
            const tempSrc = mainImage.src;
            mainImage.src = img.src;
            img.src = tempSrc;
            
            // Add click animation
            img.style.transform = 'scale(0.95)';
            setTimeout(() => {
                img.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// Show all photos modal
function showAllPhotos() {
    const modal = createPhotoModal();
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Create photo modal
function createPhotoModal() {
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closePhotoModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closePhotoModal()">&times;</button>
            <div class="modal-gallery">
                <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" alt="View 1">
                <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop" alt="View 2">
                <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop" alt="View 3">
                <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" alt="View 4">
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .photo-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2000;
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
        .modal-content {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            background: white;
            border-radius: 16px;
            overflow: hidden;
        }
        .modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            z-index: 10;
        }
        .modal-gallery {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            padding: 16px;
        }
        .modal-gallery img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 8px;
        }
    `;
    document.head.appendChild(style);
    
    return modal;
}

// Close photo modal
function closePhotoModal() {
    const modal = document.querySelector('.photo-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Calculate pricing based on dates and guests
function calculatePricing() {
    const checkinDate = document.querySelector('input[type="date"]').value;
    const checkoutDate = document.querySelectorAll('input[type="date"]')[1].value;
    const guests = document.querySelector('select').value;
    
    if (checkinDate && checkoutDate) {
        const checkin = new Date(checkinDate);
        const checkout = new Date(checkoutDate);
        const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
        
        if (nights > 0) {
            const basePrice = 109;
            const subtotal = basePrice * nights;
            const discount = Math.floor(subtotal * 0.1);
            const serviceFee = Math.floor(subtotal * 0.12);
            const total = subtotal - discount + serviceFee;
            
            // Update price breakdown
            updatePriceBreakdown(basePrice, nights, subtotal, discount, serviceFee, total);
        }
    }
}

// Update price breakdown display
function updatePriceBreakdown(basePrice, nights, subtotal, discount, serviceFee, total) {
    const priceRows = document.querySelectorAll('.price-row');
    if (priceRows.length >= 3) {
        priceRows[0].innerHTML = `<span>$${basePrice} x ${nights} nights</span><span>$${subtotal}</span>`;
        priceRows[1].innerHTML = `<span>10% campaign discount</span><span>-$${discount}</span>`;
        priceRows[2].innerHTML = `<span>Service fee</span><span>$${serviceFee}</span>`;
    }
    
    const totalRow = document.querySelector('.price-total');
    if (totalRow) {
        totalRow.innerHTML = `<span>Total</span><span>$${total}</span>`;
    }
}

// Setup sticky booking card
function setupStickyBooking() {
    const bookingCard = document.querySelector('.booking-card');
    if (!bookingCard) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                bookingCard.style.transform = 'translateY(0)';
                bookingCard.style.opacity = '1';
            }
        });
    }, {
        threshold: 0.1
    });
    
    observer.observe(bookingCard);
}

// Handle scroll effects
function handleScroll() {
    const scrolled = window.pageYOffset;
    const navbar = document.querySelector('.nav-container');
    
    if (scrolled > 100) {
        navbar.style.background = 'rgba(252, 252, 253, 0.98)';
    } else {
        navbar.style.background = 'rgba(252, 252, 253, 0.95)';
    }
}

// Setup review interactions
function setupReviewInteractions() {
    const reviewActions = document.querySelectorAll('.review-actions button');
    
    reviewActions.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const action = button.textContent.toLowerCase();
            
            if (action === 'like') {
                button.style.color = '#58C27D';
                button.textContent = 'Liked ❤️';
            } else if (action === 'reply') {
                showReplyForm(button);
            }
        });
    });
}

// Show reply form
function showReplyForm(button) {
    const reviewCard = button.closest('.review-card');
    let replyForm = reviewCard.querySelector('.reply-form');
    
    if (!replyForm) {
        replyForm = document.createElement('div');
        replyForm.className = 'reply-form';
        replyForm.innerHTML = `
            <textarea placeholder="Write a reply..." style="width: 100%; padding: 12px; border: 1px solid var(--color-grey-91); border-radius: 8px; margin: 12px 0; resize: vertical; min-height: 80px;"></textarea>
            <div style="display: flex; gap: 8px;">
                <button onclick="submitReply(this)" style="background: var(--color-azure-61); color: white; border: none; padding: 8px 16px; border-radius: 16px; cursor: pointer;">Post Reply</button>
                <button onclick="cancelReply(this)" style="background: var(--color-grey-91); border: none; padding: 8px 16px; border-radius: 16px; cursor: pointer;">Cancel</button>
            </div>
        `;
        reviewCard.appendChild(replyForm);
    }
    
    replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
}

// Submit reply
function submitReply(button) {
    const textarea = button.parentElement.previousElementSibling;
    const replyText = textarea.value.trim();
    
    if (replyText) {
        // Create reply display
        const replyDiv = document.createElement('div');
        replyDiv.className = 'reply-item';
        replyDiv.innerHTML = `
            <div style="margin-left: 20px; padding: 12px; background: var(--color-grey-99); border-radius: 8px; margin-top: 12px;">
                <strong>You</strong> <span style="font-size: 12px; color: var(--color-azure-52);">just now</span>
                <p style="margin: 8px 0 0 0; font-size: 14px;">${replyText}</p>
            </div>
        `;
        
        const reviewCard = button.closest('.review-card');
        const replyForm = button.closest('.reply-form');
        
        reviewCard.insertBefore(replyDiv, replyForm);
        replyForm.style.display = 'none';
        textarea.value = '';
        
        // Show success message
        showToast('Reply posted successfully!');
    }
}

// Cancel reply
function cancelReply(button) {
    const replyForm = button.closest('.reply-form');
    replyForm.style.display = 'none';
    replyForm.querySelector('textarea').value = '';
}

// Share property
function shareProperty() {
    if (navigator.share) {
        navigator.share({
            title: 'Spectacular views of Queenstown',
            text: 'Check out this amazing property in Queenstown!',
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
    }
}

// Save property
function saveProperty() {
    const heartBtn = document.querySelector('.hero-actions .action-btn:last-child');
    
    if (heartBtn.style.background === 'rgb(59, 113, 254)') {
        // Already saved - unsave
        heartBtn.style.background = '';
        heartBtn.style.color = '';
        showToast('Removed from saved properties');
    } else {
        // Save property
        heartBtn.style.background = 'var(--color-azure-61)';
        heartBtn.style.color = 'white';
        showToast('Property saved to your list!');
    }
}

// Reserve property
function reserveProperty() {
    const checkinDate = document.querySelector('input[type="date"]').value;
    const checkoutDate = document.querySelectorAll('input[type="date"]')[1].value;
    const guests = document.querySelector('select').value;
    
    if (!checkinDate || !checkoutDate) {
        showToast('Please select your dates first');
        return;
    }
    
    // Store booking data
    const bookingData = {
        property: 'Spectacular views of Queenstown',
        checkin: checkinDate,
        checkout: checkoutDate,
        guests: guests,
        price: document.querySelector('.price-total span:last-child').textContent,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    
    // Redirect to booking page
    window.location.href = 'booking.html';
}

// Load dynamic content
function loadDynamicContent() {
    // Simulate loading recent bookings
    setTimeout(() => {
        addRecentBookingNotification();
    }, 3000);
    
    // Load availability calendar
    loadAvailabilityCalendar();
}

// Add recent booking notification
function addRecentBookingNotification() {
    const notification = document.createElement('div');
    notification.className = 'booking-notification';
    notification.innerHTML = `
        <div style="background: var(--color-spring-green-55); color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; animation: slideIn 0.5s ease;">
            🔥 Someone just booked this property for next week!
        </div>
    `;
    
    const bookingCard = document.querySelector('.booking-card');
    bookingCard.insertBefore(notification, bookingCard.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Load availability calendar
function loadAvailabilityCalendar() {
    // Simulate calendar data
    const unavailableDates = [
        '2024-12-25', '2024-12-26', '2024-12-31',
        '2025-01-01', '2025-01-15', '2025-01-16'
    ];
    
    // Add calendar styling for unavailable dates
    const style = document.createElement('style');
    style.textContent = `
        input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(0.5);
        }
    `;
    document.head.appendChild(style);
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-blue-16);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 3000;
        font-size: 14px;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Add CSS animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
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
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .timeline-item {
        animation: fadeIn 0.5s ease;
    }
    
    .booking-card {
        animation: fadeIn 0.8s ease;
    }
`;
document.head.appendChild(animationStyles);

// Initialize pricing calculation on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(calculatePricing, 500);
});