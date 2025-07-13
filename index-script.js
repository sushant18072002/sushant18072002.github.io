// Live counter animation
let counter = 2800;
function updateCounter() {
    counter += Math.floor(Math.random() * 5) + 1;
    document.getElementById('live-counter').textContent = counter.toLocaleString();
}
setInterval(updateCounter, 8000);

// Tab switching functionality
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.search-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.search-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Show corresponding content
    const contentId = tabName + '-content';
    const content = document.getElementById(contentId);
    if (content) {
        content.classList.add('active');
    }
}

// Itinerary option selection
function selectItineraryOption(card) {
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
}

// Smooth scroll to search widget
function scrollToSearch() {
    const searchWidget = document.querySelector('.search-widget');
    searchWidget.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

// Search functionality
function performSearch() {
    const btn = event.target.closest('.search-btn');
    const originalContent = btn.innerHTML;
    
    // Get active tab
    const activeTab = document.querySelector('.search-tab.active').textContent.toLowerCase();
    
    if (activeTab.includes('complete trip')) {
        // Handle itinerary search
        const selectedOption = document.querySelector('.option-card.selected');
        const dreamInput = document.querySelector('#itinerary-content input[placeholder*="dream"]');
        
        if (!dreamInput.value.trim()) {
            dreamInput.focus();
            dreamInput.style.borderColor = '#FF6B6B';
            setTimeout(() => {
                dreamInput.style.borderColor = 'var(--color-grey-91)';
            }, 2000);
            return;
        }
        
        btn.innerHTML = '<span style="animation: spin 1s linear infinite;">✨</span><span>Creating your dream trip...</span>';
        btn.style.pointerEvents = 'none';
        
        setTimeout(() => {
            const option = selectedOption ? selectedOption.dataset.option : 'ai-magic';
            if (option === 'ai-magic') {
                window.location.href = 'itinerary-ai.html';
            } else if (option === 'packages') {
                window.location.href = 'packages.html';
            } else {
                window.location.href = 'custom-builder.html';
            }
        }, 2000);
    } else {
        // Handle flights/hotels search
        btn.innerHTML = '<span style="animation: spin 1s linear infinite;">⏳</span>';
        btn.style.pointerEvents = 'none';
        
        setTimeout(() => {
            if (activeTab.includes('flights')) {
                window.location.href = 'flights.html';
            } else {
                window.location.href = 'hotels.html';
            }
        }, 1500);
    }
}

// Adventure selection
function selectAdventure(type) {
    const card = event.currentTarget;
    
    // Add selection animation
    card.style.transform = 'scale(0.95)';
    card.style.transition = 'transform 0.2s ease';
    
    setTimeout(() => {
        card.style.transform = 'translateY(-4px) scale(1.02)';
        
        setTimeout(() => {
            // Navigate based on adventure type
            if (type === 'luxury') {
                window.location.href = 'packages.html?category=luxury';
            } else if (type === 'camping') {
                window.location.href = 'packages.html?category=adventure';
            } else {
                window.location.href = 'packages.html?category=mountain';
            }
        }, 300);
    }, 200);
}

// Destination viewing
function viewDestination(destinationId) {
    const card = event.currentTarget;
    
    // Add click animation
    card.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        card.style.transform = 'translateY(-4px)';
        
        // Navigate to destination details
        window.location.href = `itinerary-details.html?destination=${destinationId}`;
    }, 150);
}

// Destinations slider
let currentSlide = 0;
const slideWidth = 288; // 256px + 32px gap

function slideDestinations(direction) {
    const slider = document.querySelector('.destinations-slider');
    const maxSlides = slider.children.length - 3; // Show 3 cards at once
    
    if (direction === 'next' && currentSlide < maxSlides) {
        currentSlide++;
    } else if (direction === 'prev' && currentSlide > 0) {
        currentSlide--;
    }
    
    slider.scrollTo({
        left: currentSlide * slideWidth,
        behavior: 'smooth'
    });
}

// Planning selection
function selectPlanning(type) {
    const card = event.currentTarget;
    const btn = card.querySelector('.planning-cta');
    const originalText = btn.textContent;
    
    // Add selection animation
    card.style.transform = 'scale(0.98)';
    btn.innerHTML = '✨ Preparing...';
    btn.style.background = 'var(--color-spring-green-55)';
    
    setTimeout(() => {
        card.style.transform = 'translateY(-8px)';
        
        setTimeout(() => {
            // Navigate based on planning type
            if (type === 'ai-magic') {
                window.location.href = 'itinerary-ai.html';
            } else if (type === 'packages') {
                window.location.href = 'packages.html';
            } else {
                window.location.href = 'custom-builder.html';
            }
        }, 800);
    }, 200);
}

// Package viewing
function viewPackage(packageId) {
    const card = event.currentTarget;
    
    // Add click animation
    card.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        card.style.transform = 'translateY(-4px)';
        
        // Navigate to package details
        window.location.href = `itinerary-details.html?package=${packageId}`;
    }, 150);
}

// Mobile menu toggle
function toggleMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const spans = toggle.querySelectorAll('span');
    
    toggle.classList.toggle('active');
    
    if (toggle.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

// Auto-advance destinations slider
setInterval(() => {
    slideDestinations('next');
    
    // Reset to beginning when reaching end
    if (currentSlide >= document.querySelector('.destinations-slider').children.length - 3) {
        setTimeout(() => {
            currentSlide = 0;
            document.querySelector('.destinations-slider').scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        }, 3000);
    }
}, 5000);

// Intersection Observer for animations
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

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.adventure-card, .destination-card, .planning-card, .stat-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Set default dates for all date inputs
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input, index) => {
        if (index % 2 === 0) {
            input.value = today.toISOString().split('T')[0];
        } else {
            input.value = tomorrow.toISOString().split('T')[0];
        }
    });
    
    // Auto-select AI Magic option
    setTimeout(() => {
        const aiOption = document.querySelector('[data-option="ai-magic"]');
        if (aiOption) {
            aiOption.classList.add('selected');
        }
    }, 1000);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        slideDestinations('prev');
    } else if (e.key === 'ArrowRight') {
        slideDestinations('next');
    }
});

// CSS animation for spinning loader
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);