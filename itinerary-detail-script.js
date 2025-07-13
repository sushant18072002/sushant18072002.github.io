// Itinerary Details Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initViewDetails();
    initBooking();
    initMap();
});

// View Details Popup functionality
function initViewDetails() {
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
}

// Booking functionality
function initBooking() {
    const saveBtn = document.getElementById('save-btn');
    const bookBtn = document.getElementById('book-btn');
    
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
            const startDate = document.getElementById('start-date')?.value;
            const endDate = document.getElementById('end-date')?.value;
            const travelers = document.getElementById('travelers')?.value || '2';
            
            if (!startDate || !endDate) {
                alert('Please select your travel dates');
                return;
            }
            
            // Create booking page URL with parameters
            const bookingUrl = `itinerary-booking.html?package=queenstown-adventure&start=${startDate}&end=${endDate}&travelers=${travelers}`;
            window.location.href = bookingUrl;
        });
    }
}

// Map functionality
function initMap() {
    const showMapBtn = document.getElementById('show-map');
    
    if (showMapBtn) {
        showMapBtn.addEventListener('click', () => {
            // Open map in new window
            window.open('https://www.google.com/maps/place/Queenstown,+New+Zealand/@-45.0311622,168.6626435,12z', '_blank');
        });
    }
}