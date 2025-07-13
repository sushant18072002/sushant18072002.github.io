// Legal Page JavaScript

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Show terms section by default
    showSection('terms');
});

// Show specific legal section
function showSection(sectionType) {
    // Hide all sections
    document.getElementById('termsSection').style.display = 'none';
    document.getElementById('privacySection').style.display = 'none';
    
    // Remove active class from all tabs
    document.querySelectorAll('.legal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section and activate tab
    if (sectionType === 'terms') {
        document.getElementById('termsSection').style.display = 'block';
        document.querySelector('.legal-tab:first-child').classList.add('active');
        document.title = 'Terms & Conditions | TravelAI';
    } else if (sectionType === 'privacy') {
        document.getElementById('privacySection').style.display = 'block';
        document.querySelector('.legal-tab:last-child').classList.add('active');
        document.title = 'Privacy Policy | TravelAI';
    }
    
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle URL hash for direct privacy policy links
window.addEventListener('load', function() {
    if (window.location.hash === '#privacy') {
        showSection('privacy');
    }
});