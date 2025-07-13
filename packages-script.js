// Packages with detailed itineraries
const packagesData = [
    {
        id: 'paris-romance',
        title: 'Paris Romance',
        route: 'Paris → Versailles → Champagne',
        image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
        itinerary: 'Day 1: Eiffel Tower dinner, Seine cruise • Day 2: Louvre, Champs-Élysées • Day 3: Versailles Palace • Day 4: Champagne region wine tasting • Day 5: Montmartre, departure',
        duration: '5 days',
        price: 2400,
        rating: '4.9 (89)',
        tags: ['🇫🇷 France', '💕 Romance'],
        category: 'europe'
    },
    {
        id: 'bali-adventure',
        title: 'Bali Adventure',
        route: 'Ubud → Canggu → Nusa Penida',
        image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
        itinerary: 'Day 1-2: Ubud temples, rice terraces, yoga • Day 3-4: Canggu beaches, surfing • Day 5-6: Nusa Penida island hopping • Day 7: Traditional spa, departure',
        duration: '7 days',
        price: 1800,
        rating: '4.8 (156)',
        tags: ['🇮🇩 Indonesia', '🧘 Wellness'],
        category: 'asia'
    },
    {
        id: 'iceland-nature',
        title: 'Iceland Nature',
        route: 'Reykjavik → Golden Circle → South Coast',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        itinerary: 'Day 1-2: Reykjavik, Blue Lagoon • Day 3-4: Golden Circle (Geysir, Gullfoss) • Day 5-6: South Coast waterfalls, black beaches • Day 7-8: Northern lights hunting, glacier hike',
        duration: '8 days',
        price: 3600,
        rating: '4.7 (134)',
        tags: ['🇮🇸 Iceland', '🌌 Nature'],
        category: 'europe'
    },
    {
        id: 'greece-luxury',
        title: 'Greek Islands Luxury',
        route: 'Santorini → Mykonos → Crete',
        image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&h=300&fit=crop',
        itinerary: 'Day 1-3: Santorini sunset dinners, private villa • Day 4-6: Mykonos yacht tours, beach clubs • Day 7-9: Crete historical sites, luxury resort',
        duration: '9 days',
        price: 4200,
        rating: '4.9 (178)',
        tags: ['🇬🇷 Greece', '💎 Luxury'],
        category: 'europe'
    },
    {
        id: 'thailand-budget',
        title: 'Thailand Explorer',
        route: 'Bangkok → Chiang Mai → Phuket',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop',
        itinerary: 'Day 1-4: Bangkok temples, street food, markets • Day 5-8: Chiang Mai elephant sanctuary, cooking class • Day 9-12: Phuket islands, beaches, local seafood',
        duration: '12 days',
        price: 1200,
        rating: '4.6 (267)',
        tags: ['🇹🇭 Thailand', '💰 Budget'],
        category: 'asia'
    },
    {
        id: 'japan-luxury',
        title: 'Japan Luxury',
        route: 'Tokyo → Kyoto → Osaka',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
        itinerary: 'Day 1-3: Tokyo premium ryokan, private guides • Day 4-6: Kyoto temples, tea ceremony • Day 7-8: Osaka food tours, traditional crafts • Day 9-10: Mount Fuji, departure',
        duration: '10 days',
        price: 5200,
        rating: '4.9 (87)',
        tags: ['🇯🇵 Japan', '🎭 Culture'],
        category: 'asia'
    },
    {
        id: 'peru-adventure',
        title: 'Peru Adventure',
        route: 'Lima → Cusco → Machu Picchu',
        image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop',
        itinerary: 'Day 1-2: Lima food scene • Day 3-5: Cusco acclimatization, Sacred Valley • Day 6-8: Inca Trail to Machu Picchu • Day 9-11: Amazon rainforest, wildlife',
        duration: '11 days',
        price: 2800,
        rating: '4.8 (145)',
        tags: ['🇵🇪 Peru', '🏔️ Adventure'],
        category: 'americas'
    },
    {
        id: 'morocco-culture',
        title: 'Morocco Cultural',
        route: 'Marrakech → Fes → Sahara',
        image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=300&fit=crop',
        itinerary: 'Day 1-3: Marrakech medina, souks, palaces • Day 4-6: Fes traditional crafts, tanneries • Day 7-9: Sahara desert camping, camel trekking',
        duration: '9 days',
        price: 2100,
        rating: '4.7 (198)',
        tags: ['🇲🇦 Morocco', '🎭 Culture'],
        category: 'africa'
    }
];

let filteredPackages = [...packagesData];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderPackages();
    updateResultsCount();
});

// Search packages
function searchPackages() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredPackages = packagesData.filter(pkg => 
        pkg.title.toLowerCase().includes(searchTerm) ||
        pkg.route.toLowerCase().includes(searchTerm) ||
        pkg.itinerary.toLowerCase().includes(searchTerm)
    );
    
    if (currentFilter !== 'all') {
        filteredPackages = filteredPackages.filter(pkg => pkg.category === currentFilter);
    }
    
    renderPackages();
    updateResultsCount();
}

// Filter by region
function filterBy(category) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    currentFilter = category;
    
    if (category === 'all') {
        filteredPackages = [...packagesData];
    } else {
        filteredPackages = packagesData.filter(pkg => pkg.category === category);
    }
    
    // Apply search if exists
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filteredPackages = filteredPackages.filter(pkg => 
            pkg.title.toLowerCase().includes(searchTerm) ||
            pkg.route.toLowerCase().includes(searchTerm)
        );
    }
    
    renderPackages();
    updateResultsCount();
}

// Sort packages
function sortPackages() {
    const sortValue = document.getElementById('sortSelect') ? document.getElementById('sortSelect').value : 'popular';
    
    filteredPackages.sort((a, b) => {
        switch (sortValue) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'duration':
                return parseInt(a.duration) - parseInt(b.duration);
            case 'popular':
            default:
                return parseFloat(b.rating) - parseFloat(a.rating);
        }
    });
    
    renderPackages();
}

// Render packages
function renderPackages() {
    const packagesGrid = document.getElementById('packagesGrid');
    
    if (filteredPackages.length === 0) {
        packagesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--color-azure-52);">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <h3>No packages found</h3>
                <p>Try different search terms or filters</p>
            </div>
        `;
        return;
    }
    
    packagesGrid.innerHTML = filteredPackages.map(pkg => {
        const badgeType = pkg.price > 4000 ? 'luxury' : pkg.price < 2000 ? 'budget' : 'trending';
        const badgeText = pkg.price > 4000 ? '💎 Luxury' : pkg.price < 2000 ? '💰 Budget' : '🔥 Popular';
        
        return `
        <div class="package-card">
            <div class="package-image">
                <img src="${pkg.image}" alt="${pkg.title}">
                <div class="package-overlay">
                    <div class="package-badges">
                        <span class="package-badge ${badgeType}">${badgeText}</span>
                        <span class="package-badge">${pkg.duration}</span>
                    </div>
                    <div class="package-heart" onclick="toggleFavorite(event, '${pkg.id}')">♥</div>

                </div>
            </div>
            <div class="package-content">
                <div class="package-tags">
                    ${pkg.tags.map(tag => `<span class="package-tag">${tag}</span>`).join('')}
                </div>
                <div class="package-title">${pkg.title}</div>
                <div class="package-route">${pkg.route}</div>
                <div class="package-description">Temples, beaches, local culture & authentic experiences</div>
                <div class="package-highlights">
                    <span class="package-highlight">Expert Guide</span>
                    <span class="package-highlight">All Meals</span>
                    <span class="package-highlight">Transport</span>
                </div>
                <div class="package-footer">
                    <div class="package-price">
                        <div class="package-price-main">$${pkg.price.toLocaleString()}</div>
                        <div class="package-price-sub">per person</div>
                    </div>
                    <div class="package-rating">${pkg.rating}</div>
                </div>
                <div class="package-actions">
                    <button class="package-btn view-itinerary-btn" onclick="viewPackage('${pkg.id}')">View Details</button>
                    <button class="package-btn book-btn" onclick="bookPackage('${pkg.id}')">Book Now</button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Update results count
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${filteredPackages.length} packages`;
    }
}

// View package details
function viewPackage(packageId) {
    localStorage.setItem('selectedPackage', JSON.stringify({
        id: packageId,
        source: 'packages',
        timestamp: new Date().toISOString()
    }));
    
    window.location.href = `itinerary-details.html?id=${packageId}&source=packages`;
}

// Show itinerary modal
function showItinerary(packageId) {
    const selectedPackage = packagesData.find(pkg => pkg.id === packageId);
    if (!selectedPackage) return;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('itineraryModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'itineraryModal';
        modal.className = 'itinerary-modal';
        modal.innerHTML = `
            <div class="itinerary-content">
                <button class="modal-close" onclick="closeItinerary()">&times;</button>
                <div class="itinerary-title"></div>
                <div class="itinerary-details"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Update modal content
    modal.querySelector('.itinerary-title').textContent = selectedPackage.title + ' - Complete Itinerary';
    modal.querySelector('.itinerary-details').innerHTML = selectedPackage.itinerary.replace(/•/g, '<br>•');
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close itinerary modal
function closeItinerary() {
    const modal = document.getElementById('itineraryModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Book package
function bookPackage(packageId) {
    const selectedPackage = packagesData.find(pkg => pkg.id === packageId);
    if (selectedPackage) {
        localStorage.setItem('bookingPackage', JSON.stringify(selectedPackage));
        window.location.href = `hotel-booking.html?package=${packageId}`;
    }
}

// Toggle favorite
function toggleFavorite(event, packageId) {
    event.stopPropagation();
    const heart = event.target;
    
    if (heart.style.color === 'red') {
        heart.style.color = '';
        heart.textContent = '♥';
        // Remove from favorites
        let favorites = JSON.parse(localStorage.getItem('favoritePackages') || '[]');
        favorites = favorites.filter(id => id !== packageId);
        localStorage.setItem('favoritePackages', JSON.stringify(favorites));
    } else {
        heart.style.color = 'red';
        heart.textContent = '❤️';
        // Add to favorites
        let favorites = JSON.parse(localStorage.getItem('favoritePackages') || '[]');
        if (!favorites.includes(packageId)) {
            favorites.push(packageId);
            localStorage.setItem('favoritePackages', JSON.stringify(favorites));
        }
    }
}

// Load favorites on page load
document.addEventListener('DOMContentLoaded', function() {
    const favorites = JSON.parse(localStorage.getItem('favoritePackages') || '[]');
    setTimeout(() => {
        favorites.forEach(packageId => {
            const hearts = document.querySelectorAll(`[onclick*="${packageId}"]`);
            hearts.forEach(heart => {
                if (heart.classList.contains('package-heart')) {
                    heart.style.color = 'red';
                    heart.textContent = '❤️';
                }
            });
        });
    }, 100);
});

// Close modal on outside click
document.addEventListener('click', function(event) {
    const modal = document.getElementById('itineraryModal');
    if (modal && event.target === modal) {
        closeItinerary();
    }
});

// Load more packages
function loadMorePackages() {
    // Simulate loading more packages
    const morePackages = [
        {
            id: 'norway-fjords',
            title: 'Norway Fjords',
            route: 'Oslo → Bergen → Geiranger',
            image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
            itinerary: 'Day 1-2: Oslo city tour • Day 3-5: Bergen fjord cruises • Day 6-8: Geiranger dramatic landscapes • Day 9-10: Midnight sun, departure',
            duration: '10 days',
            price: 4100,
            rating: '4.8 (92)',
            tags: ['🇳🇴 Norway', '🌌 Nature'],
            category: 'europe'
        }
    ];
    
    packagesData.push(...morePackages);
    filteredPackages = [...packagesData];
    renderPackages();
    updateResultsCount();
    
    // Hide load more button
    document.querySelector('.load-more-btn').style.display = 'none';
}