// Contact Page JavaScript

// Category data with expert assignments
const categoryData = {
    planning: {
        title: 'Get Help with Trip Planning',
        subtitle: 'Our travel experts will respond within 2 minutes',
        expert: {
            name: 'Sarah Johnson',
            title: 'Senior Travel Advisor',
            image: 'https://images.unsplash.com/photo-1494790108755-2616c9c0e8e0?w=80&h=80&fit=crop&crop=face',
            stats: '⭐ 4.9 rating • 🌍 127 countries visited'
        },
        fields: {
            subject: 'What destination or trip are you planning?',
            message: 'Tell us about your travel preferences, dates, budget, and any specific questions...',
            showTripDetails: true,
            showUrgency: false
        }
    },
    booking: {
        title: 'Get Help with Booking & Payments',
        subtitle: 'We\'ll resolve your booking issue quickly',
        expert: {
            name: 'Michael Chen',
            title: 'Booking Specialist',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
            stats: '⭐ 4.8 rating • 💳 15K bookings handled'
        },
        fields: {
            subject: 'What booking issue can we help with?',
            message: 'Please provide your booking reference number and describe the issue...',
            showTripDetails: false,
            showUrgency: true
        }
    },
    technical: {
        title: 'Get Technical Support',
        subtitle: 'Our tech team will fix your issue fast',
        expert: {
            name: 'Alex Rodriguez',
            title: 'Technical Support Lead',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
            stats: '⭐ 4.9 rating • 🔧 Tech expert since 2018'
        },
        fields: {
            subject: 'What technical issue are you experiencing?',
            message: 'Describe the problem, what device you\'re using, and any error messages...',
            showTripDetails: false,
            showUrgency: false
        }
    },
    emergency: {
        title: 'Emergency Travel Support',
        subtitle: 'Urgent help - we\'ll respond immediately',
        expert: {
            name: 'Emma Davis',
            title: 'Emergency Support Manager',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
            stats: '⭐ 5.0 rating • 🚨 24/7 emergency specialist'
        },
        fields: {
            subject: 'What emergency assistance do you need?',
            message: 'Describe your urgent situation - we\'re here to help immediately...',
            showTripDetails: true,
            showUrgency: true
        }
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // FAQ items will be handled by onclick in HTML
}

// Select support category
function selectCategory(categoryId) {
    const category = categoryData[categoryId];
    if (!category) return;
    
    // Hide categories section
    document.querySelector('.help-categories').style.display = 'none';
    document.querySelector('.contact-methods').style.display = 'none';
    document.querySelector('.faq-section').style.display = 'none';
    document.querySelector('.success-stories').style.display = 'none';
    
    // Show contact form
    document.getElementById('contactForm').style.display = 'block';
    
    // Update form content
    updateFormContent(category);
    
    // Scroll to form
    document.getElementById('contactForm').scrollIntoView({ behavior: 'smooth' });
}

// Update form content based on category
function updateFormContent(category) {
    // Update header
    document.getElementById('formTitle').textContent = category.title;
    document.getElementById('formSubtitle').textContent = category.subtitle;
    
    // Update expert info
    document.getElementById('expertName').textContent = category.expert.name;
    document.getElementById('expertTitle').textContent = category.expert.title;
    document.getElementById('expertImage').src = category.expert.image;
    document.querySelector('.expert-stats').innerHTML = category.expert.stats;
    
    // Update form fields
    document.getElementById('subjectLabel').textContent = category.fields.subject;
    document.getElementById('messageLabel').textContent = 'Tell us more details';
    document.getElementById('subject').placeholder = category.fields.subject;
    document.getElementById('message').placeholder = category.fields.message;
    
    // Show/hide conditional fields
    const urgencyGroup = document.getElementById('urgencyGroup');
    const tripDetailsGroup = document.getElementById('tripDetailsGroup');
    
    urgencyGroup.style.display = category.fields.showUrgency ? 'flex' : 'none';
    tripDetailsGroup.style.display = category.fields.showTripDetails ? 'flex' : 'none';
    
    // Set urgency to emergency if emergency category
    if (category.fields.showUrgency && category.title.includes('Emergency')) {
        document.getElementById('urgency').value = 'emergency';
    }
}

// Go back to categories
function goBackToCategories() {
    // Show categories section
    document.querySelector('.help-categories').style.display = 'block';
    document.querySelector('.contact-methods').style.display = 'block';
    document.querySelector('.faq-section').style.display = 'block';
    document.querySelector('.success-stories').style.display = 'block';
    
    // Hide contact form
    document.getElementById('contactForm').style.display = 'none';
    
    // Scroll to categories
    document.querySelector('.help-categories').scrollIntoView({ behavior: 'smooth' });
}

// Submit form
function submitForm(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
        <span class="btn-icon">⏳</span>
        <span class="btn-text">Sending...</span>
        <div class="btn-subtitle">Please wait</div>
    `;
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        // Show success message
        submitBtn.innerHTML = `
            <span class="btn-icon">✅</span>
            <span class="btn-text">Message Sent!</span>
            <div class="btn-subtitle">We'll respond within 2 minutes</div>
        `;
        
        // Reset after 3 seconds
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Show success notification
            showSuccessNotification();
            
            // Reset form
            event.target.reset();
        }, 3000);
    }, 2000);
}

// Show success notification
function showSuccessNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--color-spring-green-55), var(--color-azure-61));
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        font-family: 'DM Sans', sans-serif;
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span>✅</span>
            <span>Message sent! We'll respond within 2 minutes.</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Toggle FAQ - Fixed function
function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items in the same category
    const category = faqItem.closest('.faq-category');
    category.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Open live chat
function openLiveChat() {
    // Simulate opening live chat
    alert('Live chat would open here. For demo purposes, this shows an alert.');
    
    // In real implementation, this would open a chat widget
    // Example: window.Intercom && window.Intercom('show');
}

// Call support
function callSupport() {
    // Open phone dialer
    window.location.href = 'tel:+15551234TRIP';
}

// Open WhatsApp
function openWhatsApp() {
    // Open WhatsApp with pre-filled message
    const message = encodeURIComponent('Hi! I need help with my travel planning.');
    window.open(`https://wa.me/15551234567?text=${message}`, '_blank');
}

// Search FAQ
function searchFAQ() {
    const searchTerm = document.getElementById('faqSearch').value.toLowerCase();
    const categories = document.querySelectorAll('.faq-category');
    
    categories.forEach(category => {
        const items = category.querySelectorAll('.faq-item');
        let hasVisibleItems = false;
        
        items.forEach(item => {
            const question = item.querySelector('.faq-question span').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm) || searchTerm === '') {
                item.style.display = 'block';
                hasVisibleItems = true;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Hide category if no items match
        if (hasVisibleItems || searchTerm === '') {
            category.classList.remove('hidden');
        } else {
            category.classList.add('hidden');
        }
    });
}

// Open guide
function openGuide(guideId) {
    // In a real implementation, this would open a detailed guide
    // For now, show an alert with guide info
    const guides = {
        'ai-magic': 'Complete guide to using AI Magic for trip planning',
        'custom-quiz': 'Step-by-step tutorial for the Custom Quiz Builder',
        'booking-process': 'How to book and pay for your perfect trip',
        'managing-trips': 'Managing, modifying, and tracking your bookings'
    };
    
    alert(`Opening guide: ${guides[guideId]}\n\nIn a real implementation, this would open a detailed help article.`);
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
</style>
`;

document.head.insertAdjacentHTML('beforeend', animationStyles);