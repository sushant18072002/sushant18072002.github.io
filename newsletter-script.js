// Newsletter Confirmation Page JavaScript

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    displaySubscriptionDetails();
});

// Display subscription details from URL parameters
function displaySubscriptionDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    
    // Display email if provided
    if (email) {
        document.getElementById('subscriberEmail').textContent = email;
    }
    
    // Display current date
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('subscriptionDate').textContent = formattedDate;
}

// Open social media links
function openSocial(platform) {
    const socialUrls = {
        instagram: 'https://instagram.com/travelai',
        twitter: 'https://twitter.com/travelai',
        facebook: 'https://facebook.com/travelai'
    };
    
    const url = socialUrls[platform];
    if (url) {
        window.open(url, '_blank');
    }
}

// Add confetti animation on page load
function createConfetti() {
    const colors = ['#3B71FE', '#58C27D', '#FFD166'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}vw;
                z-index: 1000;
                border-radius: 50%;
                pointer-events: none;
                animation: confettiFall 3s linear forwards;
            `;
            
            document.body.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                document.body.removeChild(confetti);
            }, 3000);
        }, i * 100);
    }
}

// Add confetti CSS animation
const confettiStyles = `
<style>
@keyframes confettiFall {
    0% {
        transform: translateY(-10px) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', confettiStyles);

// Trigger confetti on page load
setTimeout(createConfetti, 500);