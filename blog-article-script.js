// Blog Article Page JavaScript

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    trackReadingProgress();
});

// Setup event listeners
function setupEventListeners() {
    // Close popup when clicking outside
    document.getElementById('tripPopup').addEventListener('click', function(e) {
        if (e.target === this) {
            closePopup();
        }
    });
    
    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    });
}

// Share article functionality
function shareArticle(platform) {
    const articleTitle = document.querySelector('h1').textContent;
    const articleUrl = window.location.href;
    
    let shareUrl = '';
    
    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(articleUrl)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
            break;
        case 'copy':
            navigator.clipboard.writeText(articleUrl).then(() => {
                showNotification('Link copied to clipboard!');
            });
            return;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// Plan trip for specific destination
function planTrip(destination) {
    const destinations = {
        'ubud': 'Ubud Cultural Experience',
        'seminyak': 'Seminyak Beach Luxury',
        'tanah-lot': 'Tanah Lot Temple Visit'
    };
    
    const tripName = destinations[destination] || 'Bali Adventure';
    
    // Show trip planning popup
    showTripPopup(tripName);
}

// Create Bali itinerary
function createBaliItinerary() {
    showTripPopup('Complete Bali Experience');
}

// Quick plan from sidebar
function quickPlanBali() {
    const duration = document.getElementById('tripDuration').value;
    const style = document.getElementById('tripStyle').value;
    
    showTripPopup(`${duration} ${style} in Bali`);
}

// Show trip planning popup
function showTripPopup(tripType) {
    const popup = document.getElementById('tripPopup');
    const title = popup.querySelector('h3');
    const description = popup.querySelector('p');
    
    title.textContent = `Plan Your ${tripType}`;
    description.textContent = `Let our AI create a personalized ${tripType.toLowerCase()} itinerary based on your preferences`;
    
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close popup
function closePopup() {
    document.getElementById('tripPopup').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Navigate to different planning options
function goToAI() {
    closePopup();
    window.location.href = 'itinerary-ai.html?destination=bali';
}

function goToQuiz() {
    closePopup();
    window.location.href = 'custom-builder.html?destination=bali';
}

function goToPackages() {
    closePopup();
    window.location.href = 'packages.html?destination=bali';
}

// Read related article
function readArticle(articleId) {
    const articles = {
        'thailand-guide': 'Thailand Complete Travel Guide',
        'vietnam-guide': 'Vietnam Adventure Guide'
    };
    
    const articleTitle = articles[articleId];
    if (articleTitle) {
        // In real implementation, navigate to actual article
        alert(`Opening: ${articleTitle}\n\nIn a real implementation, this would navigate to the full article.`);
    }
}

// Track reading progress
function trackReadingProgress() {
    const article = document.querySelector('.main-content');
    const progressBar = createProgressBar();
    
    window.addEventListener('scroll', () => {
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        
        const articleBottom = articleTop + articleHeight;
        const windowBottom = scrollTop + windowHeight;
        
        if (scrollTop >= articleTop && scrollTop <= articleBottom) {
            const progress = Math.min(100, ((scrollTop - articleTop) / (articleHeight - windowHeight)) * 100);
            progressBar.style.width = `${Math.max(0, progress)}%`;
        }
    });
}

// Create reading progress bar
function createProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
        position: fixed;
        top: 88px;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(59, 113, 254, 0.1);
        z-index: 999;
    `;
    
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        height: 100%;
        background: var(--color-azure-61);
        width: 0%;
        transition: width 0.3s ease;
    `;
    
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
    
    return progressBar;
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-spring-green-55);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        font-family: 'DM Sans', sans-serif;
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Like article functionality
function likeArticle() {
    const likeBtn = document.querySelector('.stat-item');
    const likeNumber = likeBtn.querySelector('.stat-number');
    const currentLikes = parseInt(likeNumber.textContent.replace(',', ''));
    
    // Toggle like state
    if (likeBtn.classList.contains('liked')) {
        likeBtn.classList.remove('liked');
        likeNumber.textContent = (currentLikes - 1).toLocaleString();
        showNotification('Like removed');
    } else {
        likeBtn.classList.add('liked');
        likeNumber.textContent = (currentLikes + 1).toLocaleString();
        showNotification('Article liked!');
    }
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

.stat-item.liked .stat-icon {
    color: #e74c3c;
    animation: heartBeat 0.6s ease;
}

@keyframes heartBeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', animationStyles);