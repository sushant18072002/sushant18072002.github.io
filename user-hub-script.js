// User Hub JavaScript - Enhanced Functionality

// Tab Management
function showTab(tabName) {
    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab panel
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked tab button
    event.target.closest('.tab-btn').classList.add('active');
    
    // Update URL without page reload
    history.pushState(null, null, `#${tabName}`);
}

// Trip Filtering
function filterTrips(filter) {
    const tripItems = document.querySelectorAll('.trip-item');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Update active filter button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter trip items
    tripItems.forEach(item => {
        if (filter === 'all') {
            item.style.display = 'flex';
        } else {
            if (item.classList.contains(filter)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

// Preference Card Selection
document.addEventListener('DOMContentLoaded', function() {
    const preferenceCards = document.querySelectorAll('.preference-card');
    
    preferenceCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
});

// Toggle Switch Functionality
document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            // Add any specific functionality for notification toggles
            console.log(`Notification setting changed: ${this.checked}`);
        });
    });
});

// Trip Actions Menu
document.addEventListener('DOMContentLoaded', function() {
    const menuBtns = document.querySelectorAll('.menu-btn');
    
    menuBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Close all other menus
            document.querySelectorAll('.menu-dropdown').forEach(menu => {
                if (menu !== this.nextElementSibling) {
                    menu.style.display = 'none';
                }
            });
            
            // Toggle current menu
            const dropdown = this.nextElementSibling;
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
    });
    
    // Close menus when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.menu-dropdown').forEach(menu => {
            menu.style.display = 'none';
        });
    });
});

// Load tab from URL hash
document.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash + '-tab')) {
        // Find and click the corresponding tab button
        const tabBtn = document.querySelector(`[onclick="showTab('${hash}')"]`);
        if (tabBtn) {
            tabBtn.click();
        }
    }
});

// Notification Management
function markNotificationRead(notificationId) {
    // Update notification badge
    const badge = document.querySelector('.notification-badge');
    const currentCount = parseInt(badge.textContent);
    if (currentCount > 0) {
        badge.textContent = currentCount - 1;
        if (currentCount - 1 === 0) {
            badge.style.display = 'none';
        }
    }
}

// Progress Circle Animation
function animateProgressCircle(element, percentage) {
    const circle = element.querySelector('.progress-circle');
    const span = circle.querySelector('span');
    
    // Animate the conic gradient
    let currentPercentage = 0;
    const increment = percentage / 50; // 50 frames for smooth animation
    
    const animation = setInterval(() => {
        currentPercentage += increment;
        if (currentPercentage >= percentage) {
            currentPercentage = percentage;
            clearInterval(animation);
        }
        
        circle.style.background = `conic-gradient(var(--governor-bay) ${currentPercentage}%, var(--primary-200) 0)`;
        span.textContent = Math.round(currentPercentage) + '%';
    }, 20);
}

// Initialize progress circles on page load
document.addEventListener('DOMContentLoaded', function() {
    const progressItems = document.querySelectorAll('.progress-item');
    
    progressItems.forEach((item, index) => {
        const percentage = index === 0 ? 100 : 75; // Example percentages
        setTimeout(() => {
            animateProgressCircle(item, percentage);
        }, index * 200); // Stagger animations
    });
});

// Form Validation
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--soft-coral)';
            isValid = false;
        } else {
            input.style.borderColor = 'var(--primary-200)';
        }
    });
    
    return isValid;
}

// Save Profile Changes
function saveProfile() {
    const form = document.querySelector('#profile-tab .profile-form');
    
    if (validateForm(form)) {
        // Show loading state
        const saveBtn = form.querySelector('.save-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            saveBtn.textContent = '✅ Saved!';
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            }, 2000);
        }, 1000);
    }
}

// Save Preferences
function savePreferences() {
    const form = document.querySelector('#preferences-tab .preferences-section');
    
    // Show loading state
    const saveBtn = form.querySelector('.save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        saveBtn.textContent = '✅ Saved!';
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }, 2000);
    }, 1000);
}

// Update Password
function updatePassword() {
    const form = document.querySelector('#security-tab .security-section');
    const inputs = form.querySelectorAll('input[type="password"]');
    
    // Basic validation
    if (inputs[1].value !== inputs[2].value) {
        alert('New passwords do not match!');
        return;
    }
    
    if (inputs[1].value.length < 8) {
        alert('Password must be at least 8 characters long!');
        return;
    }
    
    // Show loading state
    const saveBtn = form.querySelector('.save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Updating...';
    saveBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        saveBtn.textContent = '✅ Updated!';
        // Clear password fields
        inputs.forEach(input => input.value = '');
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }, 2000);
    }, 1000);
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Profile save button
    const profileSaveBtn = document.querySelector('#profile-tab .save-btn');
    if (profileSaveBtn) {
        profileSaveBtn.addEventListener('click', saveProfile);
    }
    
    // Preferences save button
    const preferencesSaveBtn = document.querySelector('#preferences-tab .save-btn');
    if (preferencesSaveBtn) {
        preferencesSaveBtn.addEventListener('click', savePreferences);
    }
    
    // Security save button
    const securitySaveBtn = document.querySelector('#security-tab .save-btn');
    if (securitySaveBtn) {
        securitySaveBtn.addEventListener('click', updatePassword);
    }
});

// Smooth scroll for internal links
document.addEventListener('DOMContentLoaded', function() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Weather Widget Update (simulated)
function updateWeather() {
    const weatherTemp = document.querySelector('.weather-temp');
    const weatherDesc = document.querySelector('.weather-desc');
    
    // Simulate weather API call
    const temperatures = ['18°C', '22°C', '25°C', '20°C'];
    const descriptions = ['☀️ Sunny', '⛅ Partly Cloudy', '🌧️ Light Rain', '☁️ Cloudy'];
    
    const randomIndex = Math.floor(Math.random() * temperatures.length);
    
    weatherTemp.textContent = temperatures[randomIndex];
    weatherDesc.textContent = descriptions[randomIndex];
}

// Update weather every 5 minutes (simulated)
setInterval(updateWeather, 300000);

// Loyalty Progress Animation
function animateLoyaltyProgress() {
    const progressFill = document.querySelector('.loyalty-progress .progress-fill');
    if (progressFill) {
        progressFill.style.width = '0%';
        setTimeout(() => {
            progressFill.style.width = '75%';
        }, 500);
    }
}

// Animate loyalty progress on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(animateLoyaltyProgress, 1000);
});

// Export functions for external use
window.TravelHub = {
    showTab,
    filterTrips,
    markNotificationRead,
    saveProfile,
    savePreferences,
    updatePassword,
    updateWeather
};