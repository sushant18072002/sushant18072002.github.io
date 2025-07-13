// Itinerary Master Hub Script - Trip-First Approach

// Sample trip data
const tripData = {
    'paris-romance': {
        title: 'Paris Romance',
        duration: '5 Days',
        price: 2400,
        rating: 4.9,
        reviews: 89,
        type: 'Romance',
        description: 'Eiffel Tower dinners, Seine cruises, art museums, cozy cafes',
        highlights: ['🏰 Eiffel Tower', '🎨 Louvre Museum', '🥐 Seine Cruise'],
        itinerary: {
            day1: 'Arrival & romantic dinner at Eiffel Tower',
            day2: 'Louvre Museum & Seine river cruise',
            day3: 'Montmartre exploration & wine tasting',
            day4: 'Versailles day trip & couples spa',
            day5: 'Shopping & farewell dinner'
        }
    },
    'japan-culture': {
        title: 'Japan Discovery',
        duration: '10 Days',
        price: 3200,
        rating: 4.8,
        reviews: 156,
        type: 'Cultural',
        description: 'Temples, sushi, cherry blossoms, traditional experiences',
        highlights: ['⛩️ Ancient Temples', '🍣 Sushi Classes', '🌸 Cherry Blossoms']
    },
    'bali-wellness': {
        title: 'Bali Retreat',
        duration: '7 Days',
        price: 1800,
        rating: 4.9,
        reviews: 203,
        type: 'Wellness',
        description: 'Yoga, spas, beaches, meditation, healthy cuisine',
        highlights: ['🧘 Daily Yoga', '🌿 Spa Treatments', '🏖️ Beach Time']
    },
    'iceland-adventure': {
        title: 'Iceland Epic',
        duration: '8 Days',
        price: 3600,
        rating: 4.7,
        reviews: 134,
        type: 'Adventure',
        description: 'Northern lights, glaciers, waterfalls, hot springs',
        highlights: ['🌌 Northern Lights', '💎 Ice Caves', '♨️ Hot Springs']
    },
    'greece-islands': {
        title: 'Greek Islands',
        duration: '9 Days',
        price: 2900,
        rating: 4.8,
        reviews: 178,
        type: 'Romance',
        description: 'Santorini sunsets, Mykonos beaches, ancient history',
        highlights: ['🌅 Santorini Sunsets', '🏖️ Mykonos Beaches', '🏛️ Ancient Sites']
    },
    'thailand-adventure': {
        title: 'Thailand Explorer',
        duration: '12 Days',
        price: 1200,
        rating: 4.6,
        reviews: 267,
        type: 'Budget',
        description: 'Temples, street food, islands, elephant sanctuaries',
        highlights: ['🏛️ Golden Temples', '🍜 Street Food', '🏝️ Island Hopping']
    }
};

// View trip details
function viewTrip(tripId) {
    const trip = tripData[tripId];
    
    if (!trip) {
        console.error('Trip not found:', tripId);
        return;
    }
    
    // Store trip data for details page
    localStorage.setItem('selectedTrip', JSON.stringify(trip));
    localStorage.setItem('tripSource', 'featured');
    
    // Navigate to details page
    window.location.href = 'itinerary-details.html';
}

// Customize existing trip
function customizeTrip(event, tripId) {
    event.stopPropagation(); // Prevent card click
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '🔧 Opening...';
    btn.disabled = true;
    
    // Store trip data for customization
    const trip = tripData[tripId];
    localStorage.setItem('baseTrip', JSON.stringify(trip));
    localStorage.setItem('customizationMode', 'modify');
    
    setTimeout(() => {
        window.location.href = 'custom-builder.html';
    }, 800);
}

// Create similar trip with AI
function createSimilar(event, tripId) {
    event.stopPropagation(); // Prevent card click
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '🧠 Creating...';
    btn.disabled = true;
    
    // Store trip data as inspiration for AI
    const trip = tripData[tripId];
    const aiPrompt = `Create a trip similar to: ${trip.description}. Duration: ${trip.duration}. Type: ${trip.type}.`;
    
    localStorage.setItem('aiInspiration', JSON.stringify(trip));
    localStorage.setItem('aiPrompt', aiPrompt);
    
    setTimeout(() => {
        window.location.href = 'itinerary-ai.html';
    }, 800);
}

// View all trips
function viewAllTrips() {
    const btn = event.target;
    btn.textContent = '📦 Loading All Trips...';
    btn.disabled = true;
    
    setTimeout(() => {
        window.location.href = 'packages.html';
    }, 800);
}

// Start from scratch with AI
function startFromScratch() {
    const btn = event.target;
    btn.textContent = '🧠 Opening AI Builder...';
    btn.disabled = true;
    
    setTimeout(() => {
        window.location.href = 'itinerary-ai.html';
    }, 800);
}

// Build step by step
function buildStepByStep() {
    const btn = event.target;
    btn.textContent = '🛠️ Opening Builder...';
    btn.disabled = true;
    
    setTimeout(() => {
        window.location.href = 'custom-builder.html';
    }, 800);
}

// Search trips
function searchTrips() {
    const searchTerm = document.getElementById('tripSearch').value.toLowerCase();
    const tripCards = document.querySelectorAll('.trip-card');
    
    tripCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const tags = card.getAttribute('data-tags').toLowerCase();
        
        const matches = title.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       tags.includes(searchTerm);
        
        if (matches || searchTerm === '') {
            card.style.display = 'block';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter by tags
function filterByTag(tag) {
    // Update active tag button
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const tripCards = document.querySelectorAll('.trip-card');
    
    tripCards.forEach(card => {
        const cardTags = card.getAttribute('data-tags').toLowerCase();
        
        if (tag === 'all' || cardTags.includes(tag)) {
            card.style.display = 'block';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        } else {
            card.style.display = 'none';
        }
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth animations on scroll
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
    
    // Animate trip cards
    const tripCards = document.querySelectorAll('.trip-card');
    tripCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Animate steps
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(30px)';
        step.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
        observer.observe(step);
    });
    
    // Animate option cards
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
        observer.observe(card);
    });
    
    // Add hover effects to trip cards
    tripCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Prevent action buttons from triggering card click
    const actionButtons = document.querySelectorAll('.customize-btn, .ai-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Add click tracking for analytics
    tripCards.forEach(card => {
        card.addEventListener('click', function() {
            const tripId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            console.log('Trip card clicked:', tripId);
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Animate stats on scroll
    const stats = document.querySelectorAll('.stat-number');
    const animateStats = () => {
        stats.forEach(stat => {
            const finalValue = stat.textContent;
            const isNumber = !isNaN(parseInt(finalValue));
            
            if (isNumber) {
                const target = parseInt(finalValue.replace(/[^\d]/g, ''));
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    
                    if (finalValue.includes('K')) {
                        stat.textContent = Math.floor(current / 1000) + 'K+';
                    } else if (finalValue.includes('★')) {
                        stat.textContent = (current / 10).toFixed(1) + '★';
                    } else if (finalValue.includes('%')) {
                        stat.textContent = Math.floor(current) + '%';
                    } else {
                        stat.textContent = Math.floor(current).toLocaleString();
                    }
                }, 50);
            }
        });
    };
    
    // Trigger stats animation when visible
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    });
    
    const socialProof = document.querySelector('.social-proof');
    if (socialProof) {
        statsObserver.observe(socialProof);
    }
    
    // Add smooth scroll for better UX
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
});