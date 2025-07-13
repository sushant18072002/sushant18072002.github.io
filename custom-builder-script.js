// Custom Builder Script - Complete Redesign

let builderState = {
    currentStep: 1,
    totalSteps: 5,
    selections: {
        destination: null,
        duration: null,
        budget: null,
        style: null,
        activities: []
    }
};

// Cost calculation multipliers
const costMultipliers = {
    budget: { budget: 1, mid: 2.5, luxury: 5, ultra: 10 },
    duration: { weekend: 0.4, short: 1, medium: 2, long: 4 },
    destination: { europe: 1.2, asia: 0.8, americas: 1.1, oceania: 1.5, africa: 0.9, multiple: 1.8 }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    updateNavigation();
});

// Select option for single choice steps
function selectOption(category, value) {
    // Remove previous selection
    document.querySelectorAll(`#step${builderState.currentStep} .option-card`).forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    event.target.closest('.option-card').classList.add('selected');
    
    // Update state
    builderState.selections[category] = value;
    
    // Update sidebar
    updateSidebarSelection(category, value);
    
    // Update navigation
    updateNavigation();
    
    // Update cost estimate
    updateCostEstimate();
    
    // Auto-advance after short delay (except for activities step)
    if (builderState.currentStep < 5) {
        setTimeout(() => {
            nextStep();
        }, 800);
    }
}

// Toggle activity selection
function toggleActivity(activity) {
    const card = event.target.closest('.activity-card');
    const activities = builderState.selections.activities;
    
    if (activities.includes(activity)) {
        // Remove activity
        builderState.selections.activities = activities.filter(a => a !== activity);
        card.classList.remove('selected');
    } else {
        // Add activity
        builderState.selections.activities.push(activity);
        card.classList.add('selected');
    }
    
    // Update sidebar
    updateSidebarActivities();
    
    // Update navigation
    updateNavigation();
}

// Next step
function nextStep() {
    if (builderState.currentStep < builderState.totalSteps) {
        // Hide current step
        document.getElementById(`step${builderState.currentStep}`).classList.remove('active');
        document.getElementById(`progress${builderState.currentStep}`).classList.remove('active');
        document.getElementById(`progress${builderState.currentStep}`).classList.add('completed');
        
        // Move to next step
        builderState.currentStep++;
        
        // Show next step
        document.getElementById(`step${builderState.currentStep}`).classList.add('active');
        document.getElementById(`progress${builderState.currentStep}`).classList.add('active');
        
        // Update progress
        updateProgress();
        updateNavigation();
    }
}

// Previous step
function previousStep() {
    if (builderState.currentStep > 1) {
        // Hide current step
        document.getElementById(`step${builderState.currentStep}`).classList.remove('active');
        document.getElementById(`progress${builderState.currentStep}`).classList.remove('active');
        
        // Move to previous step
        builderState.currentStep--;
        
        // Show previous step
        document.getElementById(`step${builderState.currentStep}`).classList.add('active');
        document.getElementById(`progress${builderState.currentStep}`).classList.remove('completed');
        document.getElementById(`progress${builderState.currentStep}`).classList.add('active');
        
        // Update progress
        updateProgress();
        updateNavigation();
    }
}

// Update progress bar and text
function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const currentStepEl = document.getElementById('currentStep');
    
    const progressPercent = (builderState.currentStep / builderState.totalSteps) * 100;
    progressFill.style.width = progressPercent + '%';
    currentStepEl.textContent = builderState.currentStep;
    
    // Update mini steps
    updateMiniSteps();
}

// Update mini steps in sticky component
function updateMiniSteps() {
    for (let i = 1; i <= 5; i++) {
        const miniStep = document.getElementById(`miniStep${i}`);
        if (miniStep) {
            miniStep.classList.remove('active', 'completed');
            
            if (i < builderState.currentStep) {
                miniStep.classList.add('completed');
            } else if (i === builderState.currentStep) {
                miniStep.classList.add('active');
            }
        }
    }
}

// Update navigation buttons
function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const createBtn = document.getElementById('createBtn');
    
    // Previous button
    if (builderState.currentStep > 1) {
        prevBtn.style.display = 'block';
    } else {
        prevBtn.style.display = 'none';
    }
    
    // Next/Create button
    if (builderState.currentStep === builderState.totalSteps) {
        nextBtn.style.display = 'none';
        createBtn.style.display = 'block';
        
        // Enable create button if activities selected
        if (builderState.selections.activities.length > 0) {
            createBtn.disabled = false;
        } else {
            createBtn.disabled = true;
        }
    } else {
        nextBtn.style.display = 'block';
        createBtn.style.display = 'none';
        
        // Enable next button if current step has selection
        const currentSelection = getCurrentStepSelection();
        nextBtn.disabled = !currentSelection;
    }
}

// Get current step selection
function getCurrentStepSelection() {
    switch (builderState.currentStep) {
        case 1: return builderState.selections.destination;
        case 2: return builderState.selections.duration;
        case 3: return builderState.selections.budget;
        case 4: return builderState.selections.style;
        case 5: return builderState.selections.activities.length > 0;
        default: return false;
    }
}

// Update sidebar selection display
function updateSidebarSelection(category, value) {
    const displayNames = {
        destination: {
            europe: 'Europe',
            asia: 'Asia',
            americas: 'Americas',
            oceania: 'Oceania',
            africa: 'Africa',
            multiple: 'Multiple Regions'
        },
        duration: {
            weekend: 'Weekend (2-3 days)',
            short: 'Short (4-7 days)',
            medium: 'Medium (1-2 weeks)',
            long: 'Extended (3+ weeks)'
        },
        budget: {
            budget: 'Budget ($500-$1,500)',
            mid: 'Mid-Range ($1,500-$3,500)',
            luxury: 'Luxury ($3,500-$8,000)',
            ultra: 'Ultra Luxury ($8,000+)'
        },
        style: {
            relaxed: 'Relaxed Explorer',
            adventure: 'Adventure Seeker',
            cultural: 'Cultural Immersion',
            social: 'Social Butterfly',
            foodie: 'Foodie Journey',
            balanced: 'Balanced Mix'
        }
    };
    
    const element = document.getElementById(`selected-${category}`);
    if (element && displayNames[category] && displayNames[category][value]) {
        element.textContent = displayNames[category][value];
    }
}

// Update sidebar activities display
function updateSidebarActivities() {
    const element = document.getElementById('selected-activities');
    const activities = builderState.selections.activities;
    
    if (activities.length === 0) {
        element.textContent = 'Choose interests';
    } else if (activities.length === 1) {
        element.textContent = `${activities.length} activity selected`;
    } else {
        element.textContent = `${activities.length} activities selected`;
    }
}

// Update cost estimate
function updateCostEstimate() {
    const { destination, duration, budget } = builderState.selections;
    
    if (budget && duration) {
        const costCard = document.getElementById('costEstimateCard');
        const costRange = document.getElementById('costRange');
        
        // Base cost ranges
        const baseCosts = {
            budget: [500, 1500],
            mid: [1500, 3500],
            luxury: [3500, 8000],
            ultra: [8000, 15000]
        };
        
        let [minCost, maxCost] = baseCosts[budget];
        
        // Apply duration multiplier
        const durationMult = costMultipliers.duration[duration] || 1;
        minCost *= durationMult;
        maxCost *= durationMult;
        
        // Apply destination multiplier
        if (destination) {
            const destMult = costMultipliers.destination[destination] || 1;
            minCost *= destMult;
            maxCost *= destMult;
        }
        
        // Format and display
        const formatCost = (cost) => `$${Math.round(cost).toLocaleString()}`;
        costRange.textContent = `${formatCost(minCost)} - ${formatCost(maxCost)}`;
        costCard.style.display = 'block';
    }
}

// Create trip
function createTrip() {
    // Validate all selections
    const { destination, duration, budget, style, activities } = builderState.selections;
    
    if (!destination || !duration || !budget || !style || activities.length === 0) {
        alert('Please complete all steps before creating your trip.');
        return;
    }
    
    // Store trip data
    const tripData = {
        type: 'custom',
        selections: builderState.selections,
        timestamp: new Date().toISOString(),
        estimatedCost: document.getElementById('costRange')?.textContent || 'Not calculated'
    };
    
    localStorage.setItem('customTripData', JSON.stringify(tripData));
    
    // Hide quiz, show results
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    // Generate results
    generateCustomResults();
}

// Show success message
function showSuccessMessage() {
    const wizardMain = document.querySelector('.wizard-main');
    wizardMain.innerHTML = `
        <div class="success-message">
            <div class="success-animation">
                <div class="success-icon">🎉</div>
                <h2>Your Custom Trip is Ready!</h2>
                <p>We've created a personalized itinerary based on your detailed preferences.</p>
                
                <div class="trip-summary">
                    <h3>Your Selections:</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <strong>Destination:</strong> ${getDisplayName('destination', builderState.selections.destination)}
                        </div>
                        <div class="summary-item">
                            <strong>Duration:</strong> ${getDisplayName('duration', builderState.selections.duration)}
                        </div>
                        <div class="summary-item">
                            <strong>Budget:</strong> ${getDisplayName('budget', builderState.selections.budget)}
                        </div>
                        <div class="summary-item">
                            <strong>Style:</strong> ${getDisplayName('style', builderState.selections.style)}
                        </div>
                        <div class="summary-item">
                            <strong>Activities:</strong> ${builderState.selections.activities.length} selected
                        </div>
                    </div>
                </div>
                
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <p>Creating your perfect itinerary...</p>
                </div>
            </div>
        </div>
    `;
}

// Get display name for summary
function getDisplayName(category, value) {
    const displayNames = {
        destination: {
            europe: 'Europe',
            asia: 'Asia',
            americas: 'Americas',
            oceania: 'Oceania',
            africa: 'Africa',
            multiple: 'Multiple Regions'
        },
        duration: {
            weekend: 'Weekend (2-3 days)',
            short: 'Short (4-7 days)',
            medium: 'Medium (1-2 weeks)',
            long: 'Extended (3+ weeks)'
        },
        budget: {
            budget: 'Budget Friendly',
            mid: 'Mid-Range',
            luxury: 'Luxury',
            ultra: 'Ultra Luxury'
        },
        style: {
            relaxed: 'Relaxed Explorer',
            adventure: 'Adventure Seeker',
            cultural: 'Cultural Immersion',
            social: 'Social Butterfly',
            foodie: 'Foodie Journey',
            balanced: 'Balanced Mix'
        }
    };
    
    return displayNames[category]?.[value] || value;
}

// Generate custom results
function generateCustomResults() {
    const resultsGrid = document.getElementById('resultsGrid');
    const results = createCustomTripResults();
    
    resultsGrid.innerHTML = results.map((result, index) => `
        <div class="result-card" onclick="viewItinerary('${result.id}')">
            <div class="result-image">
                <img src="${result.image}" alt="${result.title}">
                <div class="result-badge">${result.badge}</div>
            </div>
            <div class="result-content">
                <h4>${result.title}</h4>
                <p>${result.description}</p>
                <div class="result-highlights">
                    ${result.highlights.map(h => `<div class="highlight">✓ ${h}</div>`).join('')}
                </div>
                <div class="result-footer">
                    <div class="result-price">${result.price}</div>
                    <div class="result-match">${result.match}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Create custom trip results
function createCustomTripResults() {
    const { destination, duration, budget, style } = builderState.selections;
    const results = [];
    
    // Primary result based on selections
    results.push({
        id: 'custom-primary',
        title: `${getDisplayName('style', style)} ${getDisplayName('destination', destination)}`,
        description: `Perfect ${style} experience tailored to your preferences`,
        image: getImageForDestination(destination),
        badge: 'Perfect Match',
        price: document.getElementById('costRange')?.textContent || 'Custom pricing',
        match: '100% Match',
        highlights: getCustomHighlights(style, destination)
    });
    
    // Alternative 1
    results.push({
        id: 'custom-alt1',
        title: `Premium ${getDisplayName('destination', destination)} Experience`,
        description: 'Enhanced version with luxury upgrades',
        image: getAlternativeImage(destination),
        badge: 'Upgraded',
        price: calculateUpgradedPrice(),
        match: '95% Match',
        highlights: ['Luxury accommodations', 'Private tours', 'Fine dining', 'Premium transport']
    });
    
    // Alternative 2
    results.push({
        id: 'custom-alt2',
        title: `Budget-Friendly ${getDisplayName('destination', destination)}`,
        description: 'Great value option with essential experiences',
        image: getBudgetImage(destination),
        badge: 'Best Value',
        price: calculateBudgetPrice(),
        match: '88% Match',
        highlights: ['Great value', 'Essential experiences', 'Local insights', 'Flexible schedule']
    });
    
    return results;
}

// Helper functions for results
function getImageForDestination(destination) {
    const images = {
        europe: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
        asia: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
        americas: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop',
        oceania: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        africa: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=300&fit=crop',
        multiple: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'
    };
    return images[destination] || images.europe;
}

function getAlternativeImage(destination) {
    return 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop';
}

function getBudgetImage(destination) {
    return 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop';
}

function getCustomHighlights(style, destination) {
    const highlights = {
        relaxed: ['Spa experiences', 'Scenic views', 'Comfortable pace', 'Quality time'],
        adventure: ['Outdoor activities', 'Thrilling experiences', 'Active exploration', 'Adventure guides'],
        cultural: ['Historical sites', 'Local traditions', 'Museums', 'Cultural immersion'],
        social: ['Group activities', 'Nightlife', 'Social events', 'Meeting locals'],
        foodie: ['Food tours', 'Cooking classes', 'Local cuisine', 'Fine dining'],
        balanced: ['Variety of experiences', 'Perfect balance', 'Something for everyone', 'Flexible itinerary']
    };
    return highlights[style] || highlights.balanced;
}

function calculateUpgradedPrice() {
    const currentRange = document.getElementById('costRange')?.textContent;
    if (currentRange) {
        const match = currentRange.match(/\$([\d,]+)\s*-\s*\$([\d,]+)/);
        if (match) {
            const max = parseInt(match[2].replace(',', ''));
            return `From $${Math.round(max * 1.3).toLocaleString()}`;
        }
    }
    return 'Premium pricing';
}

function calculateBudgetPrice() {
    const currentRange = document.getElementById('costRange')?.textContent;
    if (currentRange) {
        const match = currentRange.match(/\$([\d,]+)\s*-\s*\$([\d,]+)/);
        if (match) {
            const min = parseInt(match[1].replace(',', ''));
            return `From $${Math.round(min * 0.7).toLocaleString()}`;
        }
    }
    return 'Budget pricing';
}

// View itinerary
function viewItinerary(itineraryId) {
    localStorage.setItem('selectedItinerary', JSON.stringify({
        id: itineraryId,
        source: 'custom',
        selections: builderState.selections,
        timestamp: new Date().toISOString()
    }));
    
    window.location.href = 'itinerary-details.html?id=' + itineraryId;
}

// Modify selections
function modifySelections() {
    // Show quiz, hide results
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
}

// Start over
function startOver() {
    // Reset state
    builderState = {
        currentStep: 1,
        totalSteps: 5,
        selections: {
            destination: null,
            duration: null,
            budget: null,
            style: null,
            activities: []
        }
    };
    
    // Reset UI
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    
    // Reset all steps
    document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
    
    // Reset progress
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    document.getElementById('progress1').classList.add('active');
    
    // Reset selections
    document.querySelectorAll('.option-card, .activity-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Reset sidebar text
    document.getElementById('selected-destination').textContent = 'Choose region';
    document.getElementById('selected-duration').textContent = 'Choose length';
    document.getElementById('selected-budget').textContent = 'Choose range';
    document.getElementById('selected-style').textContent = 'Choose type';
    document.getElementById('selected-activities').textContent = 'Choose interests';
    
    // Hide cost estimate
    document.getElementById('costEstimateCard').style.display = 'none';
    
    updateProgress();
    updateNavigation();
}

// Add success message styles
const successStyles = `
    .success-message {
        text-align: center;
        padding: 40px 20px;
    }
    
    .success-icon {
        font-size: 64px;
        margin-bottom: 20px;
        animation: bounce 1s ease infinite;
    }
    
    .success-message h2 {
        font-size: 28px;
        font-weight: 700;
        color: var(--color-blue-16);
        margin-bottom: 12px;
    }
    
    .success-message p {
        font-size: 16px;
        color: var(--color-azure-52);
        margin-bottom: 30px;
    }
    
    .trip-summary {
        background: var(--color-grey-99);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 30px;
        text-align: left;
    }
    
    .trip-summary h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-blue-16);
        margin-bottom: 16px;
        text-align: center;
    }
    
    .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }
    
    .summary-item {
        font-size: 14px;
        color: var(--color-azure-52);
    }
    
    .summary-item strong {
        color: var(--color-blue-16);
    }
    
    .loading-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }
    
    .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--color-grey-91);
        border-top: 3px solid var(--color-custom-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    .loading-indicator p {
        font-size: 14px;
        color: var(--color-azure-52);
        margin: 0;
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
        .summary-grid {
            grid-template-columns: 1fr;
        }
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = successStyles;
document.head.appendChild(styleSheet);