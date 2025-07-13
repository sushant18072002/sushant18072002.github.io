// Blog Page JavaScript

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // No additional setup needed - functions called via onclick
}

// Search blog articles
function searchBlog() {
    const searchTerm = document.getElementById('blogSearch').value.toLowerCase();
    const articles = document.querySelectorAll('.blog-card');
    
    articles.forEach(article => {
        const title = article.querySelector('h3').textContent.toLowerCase();
        const content = article.querySelector('p').textContent.toLowerCase();
        const category = article.querySelector('.card-category').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || content.includes(searchTerm) || category.includes(searchTerm) || searchTerm === '') {
            article.classList.remove('hidden');
        } else {
            article.classList.add('hidden');
        }
    });
}

// Filter articles by category
function filterCategory(category) {
    const articles = document.querySelectorAll('.blog-card');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Update active filter button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter articles
    articles.forEach(article => {
        const articleCategory = article.getAttribute('data-category');
        
        if (category === 'all' || articleCategory === category) {
            article.classList.remove('hidden');
        } else {
            article.classList.add('hidden');
        }
    });
}

// Read article - Navigate to article page
function readArticle(articleId) {
    // Navigate to the detailed article page
    if (articleId === 'bali-guide') {
        window.location.href = 'blog-article.html';
    } else {
        // For other articles, show placeholder
        const articles = {
            'tokyo-guide': {
                title: 'Tokyo: Where Tradition Meets Future',
                description: 'Discover Japan\'s capital through ancient temples and modern marvels'
            },
            'packing-tips': {
                title: 'Smart Packing: Travel Light, Travel Right',
                description: 'Master efficient packing with expert tips and checklists'
            },
            'budget-travel': {
                title: 'Budget Travel: Amazing Trips Under $1000',
                description: 'Money-saving strategies for affordable world travel'
            },
            'street-food': {
                title: 'Street Food Adventures Around the World',
                description: 'Explore the world\'s best street food destinations'
            },
            'iceland-guide': {
                title: 'Iceland: Land of Fire and Ice',
                description: 'Experience Iceland\'s glaciers, geysers, and northern lights'
            },
            'solo-travel': {
                title: 'Solo Travel: Your Guide to Safe Adventures',
                description: 'Everything you need for safe and enjoyable solo travel'
            }
        };
        
        const article = articles[articleId];
        if (article) {
            alert(`Opening article: ${article.title}\n\n${article.description}\n\nIn a real implementation, this would open the full article page.`);
        }
    }
}

// Subscribe to newsletter
function subscribeNewsletter(event) {
    event.preventDefault();
    
    const email = event.target.querySelector('input[type="email"]').value;
    const submitBtn = event.target.querySelector('.subscribe-btn');
    
    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;
    
    // Simulate subscription process
    setTimeout(() => {
        // Redirect to confirmation page
        window.location.href = `newsletter-confirmation.html?email=${encodeURIComponent(email)}`;
    }, 2000);
}

// Share article (social sharing)
function shareArticle(articleId, platform) {
    const baseUrl = window.location.origin;
    const articleUrl = `${baseUrl}/blog/${articleId}`;
    const articleTitle = document.querySelector(`[onclick="readArticle('${articleId}')"] h3`).textContent;
    
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
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