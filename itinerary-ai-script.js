// AI Dream Builder Script - Best Approach

let dreamState = {
    currentStep: 1,
    totalSteps: 5,
    confidence: 0,
    understanding: 0,
    dreamText: '',
    preferences: {},
    conversationHistory: []
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateProgressDots();
    updateConfidence();
    
    // Add enter key listener for conversation
    document.getElementById('conversationInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendResponse();
        }
    });
});

// Fill example text
function fillExample(type) {
    const examples = {
        romantic: "I want a romantic trip to Europe with my partner. We love wine, great food, and beautiful views. Budget around $4000 for a week.",
        adventure: "Looking for an adventure in Asia. Love hiking, trying local food, and cultural experiences. 10 days, mid-range budget.",
        relaxing: "Want a relaxing beach vacation with wellness activities, spa treatments, and beautiful ocean views. 2 weeks of pure relaxation."
    };
    
    const dreamInput = document.getElementById('dreamInput');
    dreamInput.value = examples[type];
    dreamInput.focus();
    
    // Animate the button
    event.target.style.transform = 'translateX(8px)';
    setTimeout(() => {
        event.target.style.transform = 'translateX(4px)';
    }, 200);
}

// Start dream building
function startDreamBuilding() {
    const dreamInput = document.getElementById('dreamInput');
    const dreamText = dreamInput.value.trim();
    
    if (!dreamText) {
        dreamInput.focus();
        dreamInput.style.borderColor = '#ff6b6b';
        setTimeout(() => {
            dreamInput.style.borderColor = '';
        }, 2000);
        return;
    }
    
    dreamState.dreamText = dreamText;
    dreamState.currentStep = 2;
    
    // Hide input section, show conversation
    document.getElementById('dreamInputSection').style.display = 'none';
    document.getElementById('conversationSection').style.display = 'block';
    
    // Start AI analysis
    startAIAnalysis();
}

// Start AI analysis
function startAIAnalysis() {
    updateProgressDots();
    
    // Analyze the dream text
    analyzeDreamText(dreamState.dreamText);
    
    // Start conversation flow
    setTimeout(() => {
        startConversationFlow();
    }, 2000);
}

// Analyze dream text
function analyzeDreamText(text) {
    const lowerText = text.toLowerCase();
    
    // Destination analysis
    if (lowerText.includes('europe') || lowerText.includes('paris') || lowerText.includes('italy')) {
        dreamState.preferences.destination = 'Europe';
        dreamState.understanding += 20;
    } else if (lowerText.includes('asia') || lowerText.includes('japan') || lowerText.includes('thailand')) {
        dreamState.preferences.destination = 'Asia';
        dreamState.understanding += 20;
    } else if (lowerText.includes('beach') || lowerText.includes('tropical') || lowerText.includes('island')) {
        dreamState.preferences.destination = 'Tropical';
        dreamState.understanding += 20;
    }
    
    // Style analysis
    if (lowerText.includes('romantic') || lowerText.includes('couple') || lowerText.includes('partner')) {
        dreamState.preferences.style = 'Romantic';
        dreamState.understanding += 20;
    } else if (lowerText.includes('adventure') || lowerText.includes('hiking') || lowerText.includes('active')) {
        dreamState.preferences.style = 'Adventure';
        dreamState.understanding += 20;
    } else if (lowerText.includes('relax') || lowerText.includes('spa') || lowerText.includes('wellness')) {
        dreamState.preferences.style = 'Relaxation';
        dreamState.understanding += 20;
    } else if (lowerText.includes('luxury') || lowerText.includes('premium') || lowerText.includes('exclusive')) {
        dreamState.preferences.style = 'Luxury';
        dreamState.understanding += 20;
    }
    
    // Budget analysis
    const budgetMatch = text.match(/\$(\d+,?\d*)/);
    if (budgetMatch) {
        dreamState.preferences.budget = budgetMatch[0];
        dreamState.understanding += 15;
    } else if (lowerText.includes('budget') || lowerText.includes('cheap')) {
        dreamState.preferences.budget = 'Budget-friendly';
        dreamState.understanding += 15;
    } else if (lowerText.includes('luxury') || lowerText.includes('premium')) {
        dreamState.preferences.budget = 'Luxury';
        dreamState.understanding += 15;
    }
    
    // Duration analysis
    if (lowerText.includes('week') || lowerText.includes('7 day')) {
        dreamState.preferences.duration = '1 week';
        dreamState.understanding += 15;
    } else if (lowerText.includes('2 week') || lowerText.includes('14 day')) {
        dreamState.preferences.duration = '2 weeks';
        dreamState.understanding += 15;
    } else if (lowerText.includes('10 day')) {
        dreamState.preferences.duration = '10 days';
        dreamState.understanding += 15;
    }
    
    // Update confidence
    dreamState.confidence = Math.min(100, dreamState.understanding);
    updateConfidence();
}

// Start conversation flow
function startConversationFlow() {
    dreamState.currentStep = 3;
    updateProgressDots();
    
    const conversationFlow = document.getElementById('conversationFlow');
    
    // Add initial AI message
    addAIMessage("I love your dream! I can see you want " + 
        (dreamState.preferences.style ? `a ${dreamState.preferences.style.toLowerCase()} experience` : 'an amazing trip') +
        (dreamState.preferences.destination ? ` in ${dreamState.preferences.destination}` : '') + ". ");
    
    // Ask clarifying question based on what's missing
    setTimeout(() => {
        askClarifyingQuestion();
    }, 1500);
}

// Ask clarifying question
function askClarifyingQuestion() {
    const missing = [];
    if (!dreamState.preferences.destination) missing.push('destination');
    if (!dreamState.preferences.duration) missing.push('duration');
    if (!dreamState.preferences.budget) missing.push('budget');
    
    if (missing.length > 0) {
        const questions = {
            destination: "Where would you like to go? Any specific countries or regions in mind?",
            duration: "How long would you like your trip to be?",
            budget: "What's your budget range per person for this trip?"
        };
        
        addAIMessage(questions[missing[0]]);
    } else {
        // Ready to create trip
        setTimeout(() => {
            createDreamTrip();
        }, 1000);
    }
}

// Add AI message
function addAIMessage(message) {
    const conversationFlow = document.getElementById('conversationFlow');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message';
    messageDiv.innerHTML = `
        <div class="message-bubble ai-bubble">
            <div class="message-avatar">🤖</div>
            <div class="message-text">${message}</div>
        </div>
    `;
    conversationFlow.appendChild(messageDiv);
    conversationFlow.scrollTop = conversationFlow.scrollHeight;
    
    dreamState.conversationHistory.push({ type: 'ai', message });
}

// Add user message
function addUserMessage(message) {
    const conversationFlow = document.getElementById('conversationFlow');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    messageDiv.innerHTML = `
        <div class="message-bubble user-bubble">
            <div class="message-text">${message}</div>
            <div class="message-avatar">👤</div>
        </div>
    `;
    conversationFlow.appendChild(messageDiv);
    conversationFlow.scrollTop = conversationFlow.scrollHeight;
    
    dreamState.conversationHistory.push({ type: 'user', message });
}

// Send response
function sendResponse() {
    const input = document.getElementById('conversationInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addUserMessage(message);
    input.value = '';
    
    // Analyze response and update preferences
    analyzeDreamText(message);
    
    // Generate AI response
    setTimeout(() => {
        if (dreamState.understanding >= 80) {
            createDreamTrip();
        } else {
            askClarifyingQuestion();
        }
    }, 1000);
}

// Create dream trip
function createDreamTrip() {
    dreamState.currentStep = 4;
    updateProgressDots();
    
    addAIMessage("Perfect! I have everything I need. Let me create your dream trip now... ✨");
    
    setTimeout(() => {
        dreamState.currentStep = 5;
        updateProgressDots();
        showResults();
    }, 3000);
}

// Show results
function showResults() {
    dreamState.confidence = 100;
    updateConfidence();
    
    // Hide conversation, show results
    document.getElementById('conversationSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    // Generate results
    generateDreamResults();
}

// Generate dream results
function generateDreamResults() {
    const resultsShowcase = document.getElementById('resultsShowcase');
    const results = createPersonalizedResults();
    
    resultsShowcase.innerHTML = `
        <div class="results-grid">
            ${results.map((result, index) => `
                <div class="result-card ${index === 0 ? 'featured' : ''}" onclick="selectResult(${index})">
                    <div class="result-image">
                        <img src="${result.image}" alt="${result.title}">
                        <div class="result-badge ${result.badgeClass}">${result.badge}</div>
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
            `).join('')}
        </div>
    `;
}

// Create personalized results
function createPersonalizedResults() {
    const prefs = dreamState.preferences;
    const results = [];
    
    // Featured result (perfect match)
    results.push({
        title: `${prefs.style || 'Perfect'} ${prefs.destination || 'Dream'} Experience`,
        description: `Handcrafted ${prefs.style?.toLowerCase() || 'amazing'} journey designed just for you`,
        image: getImageForPreferences(prefs),
        badge: 'Perfect Match',
        badgeClass: 'perfect-match',
        price: calculatePrice(prefs, 1.0),
        match: '98% Match',
        highlights: getHighlights(prefs, 'premium')
    });
    
    // Alternative 1
    results.push({
        title: `Alternative ${prefs.destination || 'Adventure'}`,
        description: 'Great alternative with different experiences',
        image: getAlternativeImage(prefs),
        badge: 'Great Choice',
        badgeClass: 'great-choice',
        price: calculatePrice(prefs, 0.85),
        match: '89% Match',
        highlights: getHighlights(prefs, 'standard')
    });
    
    // Budget option
    results.push({
        title: 'Budget-Friendly Option',
        description: 'Amazing experiences at great value',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
        badge: 'Best Value',
        badgeClass: 'best-value',
        price: calculatePrice(prefs, 0.6),
        match: '82% Match',
        highlights: ['Great value', 'Local experiences', 'Authentic stays', 'Group activities']
    });
    
    return results;
}

// Helper functions
function getImageForPreferences(prefs) {
    if (prefs.destination === 'Europe') return 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop';
    if (prefs.destination === 'Asia') return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop';
    if (prefs.destination === 'Tropical') return 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop';
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop';
}

function getAlternativeImage(prefs) {
    return 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop';
}

function calculatePrice(prefs, multiplier) {
    let basePrice = 2500;
    if (prefs.budget && prefs.budget.includes('$')) {
        const match = prefs.budget.match(/\$(\d+,?\d*)/);
        if (match) basePrice = parseInt(match[1].replace(',', ''));
    }
    return `From $${Math.round(basePrice * multiplier).toLocaleString()}`;
}

function getHighlights(prefs, tier) {
    const highlights = {
        premium: ['Luxury accommodations', 'Private experiences', 'Expert guides', 'Fine dining'],
        standard: ['Great hotels', 'Popular attractions', 'Local guides', 'Good restaurants']
    };
    return highlights[tier] || highlights.standard;
}

// Update progress dots
function updateProgressDots() {
    const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
    
    steps.forEach((stepId, index) => {
        const step = document.getElementById(stepId);
        step.classList.remove('active', 'completed');
        
        if (index + 1 < dreamState.currentStep) {
            step.classList.add('completed');
        } else if (index + 1 === dreamState.currentStep) {
            step.classList.add('active');
        }
    });
}

// Update confidence
function updateConfidence() {
    const confidenceCircle = document.getElementById('confidenceCircle');
    const confidencePercent = document.getElementById('confidencePercent');
    const understandingLevel = document.getElementById('understandingLevel');
    const readinessLevel = document.getElementById('readinessLevel');
    
    // Update circle
    const degrees = (dreamState.confidence / 100) * 360;
    confidenceCircle.style.background = `conic-gradient(#3B71FE ${degrees}deg, #E6E8EC ${degrees}deg)`;
    confidencePercent.textContent = Math.round(dreamState.confidence) + '%';
    
    // Update understanding
    if (dreamState.confidence >= 80) {
        understandingLevel.textContent = 'Excellent';
        readinessLevel.textContent = 'Ready to create';
    } else if (dreamState.confidence >= 60) {
        understandingLevel.textContent = 'Very good';
        readinessLevel.textContent = 'Almost ready';
    } else if (dreamState.confidence >= 40) {
        understandingLevel.textContent = 'Good progress';
        readinessLevel.textContent = 'Learning more';
    } else {
        understandingLevel.textContent = 'Getting started';
        readinessLevel.textContent = 'Analyzing';
    }
    
    // Update insights
    updateAIInsights();
}

// Update AI insights
function updateAIInsights() {
    const preferencesCount = document.getElementById('preferencesCount');
    const tripStyle = document.getElementById('tripStyle');
    const bestMatch = document.getElementById('bestMatch');
    
    if (preferencesCount) {
        const foundPrefs = Object.keys(dreamState.preferences).length;
        preferencesCount.textContent = `${foundPrefs}/4`;
    }
    
    if (tripStyle) {
        if (dreamState.preferences.style) {
            tripStyle.textContent = dreamState.preferences.style;
        } else if (dreamState.understanding > 0) {
            tripStyle.textContent = 'Analyzing...';
        } else {
            tripStyle.textContent = '-';
        }
    }
    
    if (bestMatch) {
        if (dreamState.preferences.destination) {
            bestMatch.textContent = dreamState.preferences.destination;
        } else if (dreamState.understanding > 0) {
            bestMatch.textContent = 'Searching...';
        } else {
            bestMatch.textContent = '-';
        }
    }
}

// Result actions
let selectedResultIndex = 0;

function selectResult(index) {
    selectedResultIndex = index;
    
    // Update UI
    document.querySelectorAll('.result-card').forEach((card, i) => {
        card.classList.toggle('selected', i === index);
    });
}

function bookDreamTrip() {
    localStorage.setItem('dreamTripData', JSON.stringify({
        dreamText: dreamState.dreamText,
        preferences: dreamState.preferences,
        selectedResult: selectedResultIndex,
        conversationHistory: dreamState.conversationHistory,
        timestamp: new Date().toISOString()
    }));
    
    window.location.href = 'booking.html?source=dream';
}

function refinePreferences() {
    // Go back to conversation
    dreamState.currentStep = 3;
    updateProgressDots();
    
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('conversationSection').style.display = 'block';
    
    addAIMessage("What would you like to change about your trip? I can adjust any preferences.");
}

function startNewDream() {
    // Reset everything
    dreamState = {
        currentStep: 1,
        totalSteps: 5,
        confidence: 0,
        understanding: 0,
        dreamText: '',
        preferences: {},
        conversationHistory: []
    };
    
    // Reset UI
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('conversationSection').style.display = 'none';
    document.getElementById('dreamInputSection').style.display = 'block';
    document.getElementById('dreamInput').value = '';
    document.getElementById('conversationFlow').innerHTML = '';
    
    updateProgressDots();
    updateConfidence();
}

// Use popular example
function usePopularExample(type) {
    const examples = {
        romantic: "I want a romantic trip to Europe with my partner. We love wine, great food, and beautiful views. Budget around $4000 for a week.",
        adventure: "Looking for an adventure in Asia. Love hiking, trying local food, and cultural experiences. 10 days, mid-range budget.",
        beach: "Want a relaxing beach vacation with wellness activities, spa treatments, and beautiful ocean views. 2 weeks of pure relaxation."
    };
    
    document.getElementById('dreamInput').value = examples[type];
    document.querySelector('.ai-dream-builder').scrollIntoView({ behavior: 'smooth' });
    
    // Highlight the input
    const input = document.getElementById('dreamInput');
    input.focus();
    input.style.borderColor = '#3B71FE';
    setTimeout(() => {
        input.style.borderColor = '';
    }, 2000);
}

// Use AI generated itinerary
function useItinerary(itineraryId) {
    const itineraries = {
        'romantic-paris': "I want a romantic trip to Paris with wine tastings, Seine sunset cruise, and luxury hotel. 7 days, budget around $3200.",
        'japan-adventure': "Looking for adventure in Japan with temple visits, food tours, and Mount Fuji. 10 days, mid-range budget around $2800.",
        'maldives-luxury': "Want ultimate relaxation in Maldives with overwater villa, spa treatments, and snorkeling. 14 days, luxury budget.",
        'iceland-nature': "Adventure in Iceland with glacier hiking, northern lights, and hot springs. 8 days, budget around $3600.",
        'thailand-budget': "Backpacking Thailand with street food, island hopping, and local markets. 21 days, budget under $1800.",
        'italy-family': "Family trip to Italy with kids, Colosseum tour, pizza making, and art workshops. 12 days, budget around $4200."
    };
    
    document.getElementById('dreamInput').value = itineraries[itineraryId];
    document.querySelector('.ai-dream-builder').scrollIntoView({ behavior: 'smooth' });
    
    // Highlight the input
    const input = document.getElementById('dreamInput');
    input.focus();
    input.style.borderColor = '#58C27D';
    setTimeout(() => {
        input.style.borderColor = '';
    }, 2000);
}

// Load more itineraries
function loadMoreItineraries() {
    const showcaseGrid = document.getElementById('showcaseGrid');
    const moreItineraries = [
        {
            id: 'peru-culture',
            title: 'Peru Cultural Journey',
            dream: '"Ancient ruins and mountain adventures"',
            image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=250&fit=crop',
            highlights: ['🏔️ Machu Picchu', '🦙 Llama trekking', '🎭 Local culture'],
            duration: '9 days',
            price: 'From $2,400'
        },
        {
            id: 'morocco-desert',
            title: 'Morocco Desert Safari',
            dream: '"Desert adventure with authentic experiences"',
            image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=250&fit=crop',
            highlights: ['🐪 Camel trekking', '🏜️ Sahara camping', '🕌 Marrakech'],
            duration: '11 days',
            price: 'From $2,100'
        },
        {
            id: 'norway-fjords',
            title: 'Norway Fjords Explorer',
            dream: '"Dramatic landscapes and Nordic culture"',
            image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop',
            highlights: ['⛰️ Fjord cruises', '🌌 Midnight sun', '🏔️ Hiking trails'],
            duration: '10 days',
            price: 'From $4,800'
        }
    ];
    
    moreItineraries.forEach(itinerary => {
        const card = document.createElement('div');
        card.className = 'showcase-card';
        card.onclick = () => useItinerary(itinerary.id);
        card.innerHTML = `
            <div class="showcase-image">
                <img src="${itinerary.image}" alt="${itinerary.title}">
                <div class="ai-badge">AI Created</div>
            </div>
            <div class="showcase-content">
                <h4>${itinerary.title}</h4>
                <p class="user-dream">${itinerary.dream}</p>
                <div class="showcase-highlights">
                    ${itinerary.highlights.map(h => `<span class="highlight">${h}</span>`).join('')}
                </div>
                <div class="showcase-footer">
                    <span class="duration">${itinerary.duration}</span>
                    <span class="price">${itinerary.price}</span>
                </div>
            </div>
        `;
        showcaseGrid.appendChild(card);
    });
    
    // Hide load more button
    document.querySelector('.load-more-btn').style.display = 'none';
    document.querySelector('.showcase-note').textContent = 'Showing all AI-generated itineraries';
}

// Add CSS for message bubbles
const messageStyles = `
    .ai-message, .user-message {
        margin-bottom: 16px;
        animation: slideIn 0.3s ease;
    }
    
    .message-bubble {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        max-width: 80%;
    }
    
    .user-bubble {
        margin-left: auto;
        flex-direction: row-reverse;
    }
    
    .message-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #3B71FE;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        flex-shrink: 0;
    }
    
    .user-bubble .message-avatar {
        background: #4A90E2;
    }
    
    .message-text {
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .ai-bubble .message-text {
        background: #f0f8ff;
        color: #23262F;
    }
    
    .user-bubble .message-text {
        background: #4A90E2;
        color: white;
    }
    
    .results-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 30px;
    }
    
    .result-card {
        border: 2px solid #E6E8EC;
        border-radius: 16px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .result-card.featured {
        border-color: #58C27D;
        transform: scale(1.02);
    }
    
    .result-card.selected {
        border-color: #3B71FE;
        box-shadow: 0 8px 24px rgba(59, 113, 254, 0.2);
    }
    
    .result-image {
        position: relative;
        height: 150px;
    }
    
    .result-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .result-badge {
        position: absolute;
        top: 8px;
        left: 8px;
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 700;
        color: white;
    }
    
    .perfect-match { background: #58C27D; }
    .great-choice { background: #3B71FE; }
    .best-value { background: #FFD166; color: #23262F; }
    
    .result-content {
        padding: 16px;
    }
    
    .result-content h4 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
    }
    
    .result-content p {
        font-size: 12px;
        color: #777E90;
        margin-bottom: 12px;
    }
    
    .result-highlights {
        margin-bottom: 12px;
    }
    
    .highlight {
        font-size: 10px;
        color: #58C27D;
        margin-bottom: 2px;
    }
    
    .result-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .result-price {
        font-size: 14px;
        font-weight: 700;
        color: #23262F;
    }
    
    .result-match {
        font-size: 11px;
        color: #58C27D;
        font-weight: 600;
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = messageStyles;
document.head.appendChild(styleSheet);