// Details Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initGallery();
    initBookingCard();
    initReviews();
    initCarousel();
    initNewsletter();
    initItinerary();
});

// Itinerary functionality
function initItinerary() {
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    const popupOverlay = document.getElementById('popup-overlay');
    const popupClose = document.getElementById('popup-close');
    const popupTitle = document.getElementById('popup-title');
    const popupBody = document.getElementById('popup-body');
    
    const dayDetails = {
        '1': {
            title: '🛬 Day 1: Arrival & Welcome',
            schedule: [
                { time: '10:00 AM', activity: 'Airport Pickup', description: 'Luxury vehicle pickup from Queenstown Airport' },
                { time: '12:00 PM', activity: 'Hotel Check-in', description: 'Check into luxury accommodation with room orientation' },
                { time: '7:00 PM', activity: 'Welcome Dinner', description: 'Traditional New Zealand cuisine at The Bunker Restaurant' }
            ]
        },
        '2': {
            title: '🚁 Day 2: Helicopter & Milford Sound',
            schedule: [
                { time: '8:00 AM', activity: 'Helicopter Departure', description: 'Scenic flight from Queenstown over stunning landscapes' },
                { time: '10:30 AM', activity: 'Milford Sound Cruise', description: 'Wildlife spotting and fjord exploration' },
                { time: '4:00 PM', activity: 'Return Flight', description: 'Helicopter return to Queenstown with aerial views' }
            ]
        },
        '3': {
            title: '🪂 Day 3: Adventure Sports',
            schedule: [
                { time: '9:00 AM', activity: 'Bungee Jumping', description: 'Kawarau Gorge - birthplace of commercial bungee jumping' },
                { time: '1:00 PM', activity: 'Jet Boat Experience', description: 'Shotover Jet - high-speed thrills through narrow canyons' },
                { time: '4:00 PM', activity: 'Wine Tasting', description: 'Central Otago wine region tour with premium tastings' }
            ]
        },
        '4': {
            title: '🎿 Day 4: Skiing & Relaxation',
            schedule: [
                { time: '8:00 AM', activity: 'Breakfast & Equipment', description: 'Breakfast and ski equipment pickup' },
                { time: '9:30 AM', activity: 'The Remarkables Skiing', description: 'Full day skiing at The Remarkables ski area' },
                { time: '3:00 PM', activity: 'Spa & Fine Dining', description: 'Relaxing spa treatment followed by fine dining experience' }
            ]
        },
        '5': {
            title: '🥾 Day 5: Hiking & Culture',
            schedule: [
                { time: '7:00 AM', activity: 'Ben Lomond Track', description: 'Guided hiking at Ben Lomond Track with panoramic views' },
                { time: '2:00 PM', activity: 'Local Markets', description: 'Explore local markets and cultural experiences' },
                { time: '6:00 PM', activity: 'Free Time', description: 'Free time for personal exploration and relaxation' }
            ]
        },
        '6': {
            title: '🌄 Day 6: Scenic Tours',
            schedule: [
                { time: '9:00 AM', activity: 'Lake Wanaka', description: 'Scenic drive and tour of beautiful Lake Wanaka' },
                { time: '2:00 PM', activity: 'Arrowtown Historic Tour', description: 'Explore the historic gold mining town of Arrowtown' },
                { time: '7:00 PM', activity: 'Farewell Dinner', description: 'Special farewell dinner with group and guides' }
            ]
        },
        '7': {
            title: '✈️ Day 7: Departure',
            schedule: [
                { time: '8:00 AM', activity: 'Breakfast', description: 'Final breakfast at the hotel' },
                { time: '10:00 AM', activity: 'Souvenir Shopping', description: 'Last-minute shopping for souvenirs and gifts' },
                { time: '12:00 PM', activity: 'Airport Transfer', description: 'Luxury transfer to Queenstown Airport for departure' }
            ]
        }
    };
    
    // View details button functionality
    if (viewDetailsBtns.length > 0) {
        viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dayNum = btn.dataset.day;
                const dayData = dayDetails[dayNum];
                
                if (dayData && popupOverlay) {
                    popupTitle.textContent = dayData.title;
                    
                    const scheduleHTML = dayData.schedule.map(item => `
                        <div class="time-item">
                            <div class="time-badge">${item.time}</div>
                            <div class="time-content">
                                <div class="time-activity">${item.activity}</div>
                                <div class="time-description">${item.description}</div>
                            </div>
                        </div>
                    `).join('');
                    
                    popupBody.innerHTML = `<div class="time-schedule">${scheduleHTML}</div>`;
                    popupOverlay.style.display = 'flex';
                }
            });
        });
    }
    
    // Close popup functionality
    if (popupClose) {
        popupClose.addEventListener('click', () => {
            popupOverlay.style.display = 'none';
        });
    }
    
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                popupOverlay.style.display = 'none';
            }
        });
    }

    // Booking functionality
    const saveBtn = document.getElementById('save-btn');
    const bookBtn = document.getElementById('book-btn');
    const showMapBtn = document.getElementById('show-map');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveBtn.textContent = 'Saved ✓';
            saveBtn.style.background = '#58C27D';
            saveBtn.style.color = 'white';
            setTimeout(() => {
                saveBtn.textContent = 'Save +';
                saveBtn.style.background = '';
                saveBtn.style.color = '';
            }, 2000);
        });
    }
    
    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            // Get form values
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            const travelers = document.getElementById('travelers').value;
            
            if (!startDate || !endDate) {
                alert('Please select your travel dates');
                return;
            }
            
            // Create booking page URL with parameters
            const bookingUrl = `itinerary-booking.html?package=queenstown-adventure&start=${startDate}&end=${endDate}&travelers=${travelers}`;
            window.location.href = bookingUrl;
        });
    }
    
    if (showMapBtn) {
        showMapBtn.addEventListener('click', () => {
            // Open map in new window or show modal
            window.open('https://www.google.com/maps/place/Queenstown,+New+Zealand/@-45.0311622,168.6626435,12z', '_blank');
        });
    }

    // Legacy timeline functionality (if exists)
    const legacyTimelineItems = document.querySelectorAll('.timeline-item');
    
    legacyTimelineItems.forEach(item => {
        const header = item.querySelector('h4');
        const expandBtn = item.querySelector('.expand-btn');
        const details = item.querySelector('.day-details');
        
        if (header && expandBtn && details) {
            header.addEventListener('click', () => {
                const isExpanded = details.style.display === 'block';
                
                // Close all other details
                legacyTimelineItems.forEach(otherItem => {
                    const otherDetails = otherItem.querySelector('.day-details');
                    const otherBtn = otherItem.querySelector('.expand-btn');
                    if (otherDetails && otherBtn && otherItem !== item) {
                        otherDetails.style.display = 'none';
                        otherBtn.textContent = '+';
                        otherBtn.classList.remove('active');
                    }
                });
                
                // Toggle current item
                if (isExpanded) {
                    details.style.display = 'none';
                    expandBtn.textContent = '+';
                    expandBtn.classList.remove('active');
                } else {
                    details.style.display = 'block';
                    expandBtn.textContent = '−';
                    expandBtn.classList.add('active');
                }
            });
        }
    });
}

// Gallery functionality
function initGallery() {
    const mainImage = document.querySelector('.main-image');
    const sideImages = document.querySelectorAll('.side-gallery img');
    const galleryBtn = document.querySelector('.gallery-btn');
    
    // Side image click handlers
    sideImages.forEach(img => {
        img.addEventListener('click', () => {
            const tempSrc = mainImage.src;
            mainImage.src = img.src.replace('w=272&h=272', 'w=832&h=832');
            img.src = tempSrc.replace('w=832&h=832', 'w=272&h=272');
        });
    });
    
    // Gallery button
    galleryBtn.addEventListener('click', () => {
        showGalleryModal();
    });
}

// Booking card functionality
function initBookingCard() {
    const saveBtn = document.querySelector('.save-btn');
    const reserveBtn = document.querySelector('.reserve-btn');
    
    saveBtn.addEventListener('click', () => {
        saveBtn.textContent = saveBtn.textContent.includes('Saved') ? 'Save +' : 'Saved ✓';
        saveBtn.style.background = saveBtn.textContent.includes('Saved') ? '#58C27D' : 'transparent';
        saveBtn.style.color = saveBtn.textContent.includes('Saved') ? 'white' : '#23262F';
    });
    
    reserveBtn.addEventListener('click', () => {
        showBookingModal();
    });
}

// Reviews functionality
function initReviews() {
    const starRating = document.querySelector('.star-rating');
    const stars = starRating.querySelectorAll('.star');
    const postBtn = document.querySelector('.post-btn');
    const textarea = document.querySelector('textarea');
    const emojiBtn = document.querySelector('.emoji-btn');
    
    let selectedRating = 0;
    
    // Star rating
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStarDisplay();
        });
        
        star.addEventListener('mouseenter', () => {
            highlightStars(index + 1);
        });
    });
    
    starRating.addEventListener('mouseleave', () => {
        updateStarDisplay();
    });
    
    function highlightStars(count) {
        stars.forEach((star, index) => {
            star.style.opacity = index < count ? '1' : '0.3';
        });
    }
    
    function updateStarDisplay() {
        stars.forEach((star, index) => {
            star.style.opacity = index < selectedRating ? '1' : '0.3';
        });
    }
    
    // Post review
    postBtn.addEventListener('click', () => {
        const reviewText = textarea.value.trim();
        if (reviewText && selectedRating > 0) {
            addNewReview(reviewText, selectedRating);
            textarea.value = '';
            selectedRating = 0;
            updateStarDisplay();
        } else {
            showNotification('Please add a rating and review text', 'error');
        }
    });
    
    // Emoji button
    emojiBtn.addEventListener('click', () => {
        const emojis = ['😊', '😍', '🤩', '👍', '❤️', '🔥', '✨', '🎉'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        textarea.value += randomEmoji;
    });
    
    // Comment actions
    document.querySelectorAll('.comment-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.textContent;
            if (action === 'Like') {
                e.target.textContent = e.target.textContent === 'Like' ? 'Liked ❤️' : 'Like';
            }
        });
    });
}

// Carousel functionality
function initCarousel() {
    const carouselBtns = document.querySelectorAll('.carousel-btn');
    const propertiesGrid = document.querySelector('.properties-grid');
    
    carouselBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const scrollAmount = 288; // card width + gap
            const direction = index === 0 ? -1 : 1;
            propertiesGrid.scrollBy({
                left: scrollAmount * direction,
                behavior: 'smooth'
            });
        });
    });
}

// Newsletter functionality
function initNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    const emailInput = newsletterForm.querySelector('input');
    const submitBtn = newsletterForm.querySelector('.submit-btn');
    
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        
        if (validateEmail(email)) {
            showNotification('Thank you for subscribing!', 'success');
            emailInput.value = '';
        } else {
            showNotification('Please enter a valid email address', 'error');
        }
    });
    
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
}

// Helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '600',
        zIndex: '1000',
        background: type === 'error' ? '#FF3B30' : type === 'success' ? '#58C27D' : '#3B71FE',
        animation: 'slideIn 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showGalleryModal() {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 40px;">
            <div style="position: relative; max-width: 90%; max-height: 90%;">
                <img src="${document.querySelector('.main-image').src}" style="max-width: 100%; max-height: 100%; border-radius: 16px;">
                <button onclick="this.closest('div').remove()" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 20px;">✕</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function showBookingModal() {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
            <div style="background: white; border-radius: 24px; padding: 32px; max-width: 400px; width: 90%; text-align: center;">
                <h3 style="margin-bottom: 16px; font-size: 24px;">🎉 Booking Request Sent!</h3>
                <p style="margin-bottom: 24px; color: #777E90;">Your booking request has been sent to the host. You'll receive a confirmation within 24 hours.</p>
                <button onclick="this.closest('div').remove()" style="background: #3B71FE; color: white; border: none; border-radius: 12px; padding: 12px 24px; font-weight: 600; cursor: pointer;">Got it!</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        if (document.body.contains(modal)) {
            modal.remove();
        }
    }, 5000);
}

function addNewReview(text, rating) {
    const commentsSection = document.querySelector('.comments-section');
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    
    const stars = '⭐'.repeat(rating);
    const now = new Date();
    
    newComment.innerHTML = `
        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=48&h=48&fit=crop&crop=face" class="comment-avatar">
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-author">You</span>
                <div class="comment-rating">${stars}</div>
            </div>
            <p class="comment-text">${text}</p>
            <div class="comment-actions">
                <span class="comment-time">just now</span>
                <button class="comment-action">Like</button>
                <button class="comment-action">Reply</button>
            </div>
        </div>
    `;
    
    // Insert after the comments header
    const firstComment = commentsSection.querySelector('.comment');
    if (firstComment) {
        commentsSection.insertBefore(newComment, firstComment);
    } else {
        commentsSection.appendChild(newComment);
    }
    
    // Update comment count
    const commentCount = document.querySelector('.comments-header h4');
    const currentCount = parseInt(commentCount.textContent.match(/\d+/)[0]);
    commentCount.textContent = `${currentCount + 1} comments`;
    
    showNotification('Review posted successfully!', 'success');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .notification {
        animation: slideIn 0.3s ease;
    }
    
    .property-card {
        transition: transform 0.3s ease;
    }
    
    .property-card:hover {
        transform: translateY(-4px);
    }
    
    .day-details {
        animation: slideDown 0.3s ease;
    }
`;
document.head.appendChild(style);