// DOM Elements
const quoteTextEl = document.getElementById('quoteText');
const quoteAuthorEl = document.getElementById('quoteAuthor');
const quoteImageEl = document.getElementById('quoteImage');
const newQuoteBtn = document.getElementById('newQuote');
const favoriteBtn = document.getElementById('favoriteBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const langSelectEl = document.getElementById('langSelect');
const themeToggleBtn = document.getElementById('themeToggle');
const favoritesLinkEl = document.getElementById('favoritesLink');
const favoritesModalEl = document.getElementById('favoritesModal');
const closeModalBtn = document.querySelector('.close-modal');
const favoritesListEl = document.getElementById('favoritesList');
const categorySelectEl = document.getElementById('categorySelect');

// State
let quotes = [
    {
      "text": {
        "en": "Believe in yourself.",
        "ja": "自分を信じて。",
        "fr": "Crois en toi.",
        "es": "Cree en ti mismo.",
        "ga": "Creid i dfhéin."
      },
      "author": "Unknown",
      "category": "motivational",
      "image": "images/0.jpg"
    },
    {
      "text": {
        "en": "To know oneself is to study oneself in action with another person.",
        "ja": "自分を知るとは、他人との関わりの中で自分を観察することだ。",
        "fr": "Se connaître, cest sétudier en action avec une autre personne.",
        "es": "Conocerse es estudiarse en acción con otra persona.",
        "ga": "Is é féinfhios a bheith ag staidéar ort féin le duine eile."
      },
      "author": "Bruce Lee",
      "category": "inspirational",
      "image": "images/1.jpg"
    },
    {
      "text": {
        "en": "Power comes in response to a need, not a desire.",
        "ja": "力は欲望ではなく必要に応じて現れる。",
        "fr": "Le pouvoir vient en réponse à un besoin, pas à un désir.",
        "es": "El poder surge en respuesta a una necesidad, no a un deseo.",
        "ga": "Tagann cumhacht mar fhreagra ar riachtanas, ní ar mhian."
      },
      "author": "Goku",
      "category": "anime",
      "Title": "Dragonball",
      "image": "images/2.jpg"
    },
    {
      "text": {
        "en": "Just keep swimming.",
        "ja": "とにかく泳ぎ続けて。",
        "fr": "Continue à nager.",
        "es": "Sigue nadando.",
        "ga": "Lean ort ag snámh."
      },
      "author": "Dory",
      "category": "movie",
      "Title": "Finding Nemo",
      "image": "images/3.jpg"
    },
    {
      "text": {
        "en": "Why so serious?",
        "ja": "そんなに真剣になるな。",
        "fr": "Pourquoi si sérieux ?",
        "es": "¿Por qué tan serio?",
        "ga": "Cén fáth chomh dáiríre sin?"
      },
      "author": "Joker",
      "category": "movie",
      "Title": "Dark Knight(2008)",
      "image": "images/4.jpg"
    },
    {
      "text": {
        "en": "I'd rather trust and regret than doubt and regret.",
        "ja": "疑って後悔するより信じて後悔したい。",
        "fr": "Je préfère faire confiance et regretter que douter et regretter.",
        "es": "Prefiero confiar y arrepentirme que dudar y arrepentirme.",
        "ga": "Is fearr liom muinín agus aiféala ná amhras agus aiféala."
      },
      "author": "Kirito",
      "category": "anime",
      "Title": "Sword Art Online",
      "image": "images/5.jpg"
    },
    {
      "text": {
        "en": "It's over 9000!",
        "ja": "9000を超えている!",
        "fr": "Cest plus de 9000 !",
        "es": "¡Es más de 9000!",
        "ga": "Tá sé os cionn 9000!"
      },
      "author": "Vegeta",
      "category": "anime",
      "Title": "Dragonball",
      "image": "images/6.jpg"
    },
    {
      "text": {
        "en": "You're gonna be a bridesmaid, but you're never gonna be a bride!",
        "ja": "あなたは常にブライズメイド、決して花嫁にはならない！",
        "fr": "Tu seras demoiselle dhonneur, jamais mariée !",
        "es": "¡Serás dama de honor, pero nunca la novia!",
        "ga": "Beidh tú i do bhrídeog, ach ní bheidh tú i do bhríde."
      },
      "author": "Annie",
      "category": "movie",
      "Title": "Bridesmaids (2011)",
      "image": "images/7.jpg"
    },
    {
      "text": {
        "en": "I'm not a hero, I'm just a guy who likes to eat.",
        "ja": "俺はヒーローじゃない。ただ食べるのが好きなだけだ。",
        "fr": "Je ne suis pas un héros, juste un gars qui aime manger.",
        "es": "No soy un héroe, solo un tipo que le gusta comer.",
        "ga": "Ní laoch mé, ach duine a thaitníonn bia leis."
      },
      "author": "Goku",
      "category": "anime",
      "Title": "Dragonball",
      "image": "images/8.jpg"
    },
    {
      "text": {
        "en": "I am not gonna run away, I never go back on my word! That is my nindo: my ninja way.",
        "ja": "俺は逃げない、言ったことは曲げねえ！それが俺の忍道だ。",
        "fr": "Je ne fuirai pas et je ne reviendrai jamais sur ma parole ! Cest mon nindo, ma voie ninja.",
        "es": "¡No voy a huir y nunca me retracto de mi palabra! Ese es mi nindo: mi camino ninja.",
        "ga": "Ní rithfidh mé agus ní sháróidh mé mo fhocal! Sin é mo bhealach ninja."
      },
      "author": "Naruto",
      "category": "anime",
      "Title": "Naruto",
      "image": "images/9.jpg"
    }
];
let currentQuote = {};
let currentLang = 'en';
let currentCategory = 'all'; // New state variable
let isFavorite = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle(savedTheme);
    
    // Load language preference
    const savedLang = localStorage.getItem('lang') || 'en';
    currentLang = savedLang;
    langSelectEl.value = savedLang;

    // Load category preference
    const savedCategory = localStorage.getItem('category') || 'all';
    currentCategory = savedCategory;
    
    // Initialize categories dropdown
    populateCategories();
    
    // Load initial quote
    generateQuote();
    
    // Set up event listeners
    setupEventListeners();
});


//function to populate categories dropdown
function populateCategories() {
    const categories = new Set();
    quotes.forEach(quote => {
        if (quote.category) {
            categories.add(quote.category);
        }
    });
    
    // Sort categories alphabetically
    const sortedCategories = Array.from(categories).sort();
    
    categorySelectEl.innerHTML = `
        <option value="all">All Categories</option>
        ${sortedCategories.map(cat => 
            `<option value="${cat}" ${currentCategory === cat ? 'selected' : ''}>
                ${cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>`
        ).join('')}
    `;
}

// function to get filtered quotes by category
function getFilteredQuotes() {
    if (currentCategory === 'all') {
        return quotes;
    }
    return quotes.filter(quote => quote.category === currentCategory);
}

// Modified generateQuote function to use filtered quotes
function generateQuote() {
    const filteredQuotes = getFilteredQuotes();
    if (filteredQuotes.length === 0) {
        showErrorState('No quotes available in this category');
        return;
    }
}

// Generate random quote
function generateQuote() {
    if (quotes.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    currentQuote = quotes[randomIndex];
    updateDisplay();
    checkIfFavorite();
    
    // Add animation class
    quoteTextEl.classList.add('animate-fade');
    quoteAuthorEl.classList.add('animate-fade');
    setTimeout(() => {
        quoteTextEl.classList.remove('animate-fade');
        quoteAuthorEl.classList.remove('animate-fade');
    }, 500);
}

// Update UI with current quote
function updateDisplay() {
    const quoteText = currentQuote.text?.[currentLang] || currentQuote.text?.en || 'Quote not available';
    const author = currentQuote.author || 'Unknown';
    const image = currentQuote.image || '';
    const title = currentQuote.Title ? ` (${currentQuote.Title})` : '';
    const category = currentQuote.category ? ` - ${currentQuote.category.charAt(0).toUpperCase() + currentQuote.category.slice(1)}` : '';
    
    quoteTextEl.textContent = quoteText;
    quoteAuthorEl.textContent = `— ${author}`;
    
    if (image) {
        quoteImageEl.src = image;
        quoteImageEl.style.display = 'block';
    } else {
        quoteImageEl.style.display = 'none';
    }
}

// Check if current quote is favorited
function checkIfFavorite() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const currentQuoteText = currentQuote.text?.[currentLang] || currentQuote.text?.en;
    isFavorite = favorites.some(fav => 
        fav.text === currentQuoteText && 
        fav.author === currentQuote.author
    );
    updateFavoriteButton();
}

// Update favorite button appearance
function updateFavoriteButton() {
    favoriteBtn.innerHTML = isFavorite ? 
        '<i class="fas fa-heart"></i> Remove Favorite' : 
        '<i class="far fa-heart"></i> Add Favorite';
    favoriteBtn.classList.toggle('active', isFavorite);
}

// Toggle favorite status
function toggleFavorite() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const currentQuoteText = currentQuote.text?.[currentLang] || currentQuote.text?.en;
    
    if (isFavorite) {
        // Remove from favorites
        const updatedFavorites = favorites.filter(fav => 
            !(fav.text === currentQuoteText && fav.author === currentQuote.author)
        );
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        showFeedback('Removed from favorites!');
    } else {
        // Add to favorites
        favorites.push({
            text: currentQuoteText,
            author: currentQuote.author,
            image: currentQuote.image,
            lang: currentLang
        });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        showFeedback('Added to favorites!');
    }
    
    isFavorite = !isFavorite;
    updateFavoriteButton();
    loadFavorites();
}

// Load favorites into the modal
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesListEl.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesListEl.innerHTML = '<p class="empty-state">No favorite quotes yet. Add some!</p>';
        return;
    }
    
    favorites.forEach((fav, index) => {
        const favEl = document.createElement('div');
        favEl.className = 'favorite-item';
        favEl.innerHTML = `
            ${fav.image ? `<img src="${fav.image}" alt="Favorite quote image">` : ''}
            <p>"${fav.text}"</p>
            <p>— ${fav.author}</p>
            <button class="remove-favorite" data-index="${index}">
                <i class="fas fa-trash"></i> Remove
            </button>
        `;
        favoritesListEl.appendChild(favEl);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.closest('button').dataset.index;
            removeFavorite(index);
        });
    });
}

// Remove favorite by index
function removeFavorite(index) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
    
    // If the current quote was removed from favorites, update the button
    checkIfFavorite();
}

// Copy quote to clipboard
async function copyQuote() {
    const text = `"${currentQuote.text?.[currentLang] || currentQuote.text?.en}" — ${currentQuote.author}`;
    try {
        await navigator.clipboard.writeText(text);
        showFeedback('Quote copied to clipboard!');
    } catch (err) {
        showFeedback('Failed to copy quote');
        console.error('Failed to copy:', err);
    }
}

// Share quote
async function shareQuote() {
    const text = `"${currentQuote.text?.[currentLang] || currentQuote.text?.en}" — ${currentQuote.author}`;
    
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Quotes R Us',
                text: text,
                url: window.location.href
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            await navigator.clipboard.writeText(text);
            showFeedback('Quote copied to share!');
        }
    } catch (err) {
        console.error('Error sharing:', err);
    }
}

// Change language
function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updateDisplay();
    checkIfFavorite();
}

// Toggle dark/light theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
}

// Update theme toggle button
function updateThemeToggle(theme) {
    themeToggleBtn.innerHTML = theme === 'dark' ? 
        '<i class="fas fa-sun"></i> Light Mode' : 
        '<i class="fas fa-moon"></i> Dark Mode';
}

// Toggle favorites modal
function toggleFavoritesModal() {
    favoritesModalEl.classList.toggle('hidden');
    if (!favoritesModalEl.classList.contains('hidden')) {
        favoritesModalEl.classList.add('show');
        loadFavorites();
    }
}

// Show feedback message
function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.textContent = message;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        feedback.classList.remove('show');
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
}

// Set up event listeners
function setupEventListeners() {
    newQuoteBtn.addEventListener('click', generateQuote);
    favoriteBtn.addEventListener('click', toggleFavorite);
    copyBtn.addEventListener('click', copyQuote);
    shareBtn.addEventListener('click', shareQuote);
    langSelectEl.addEventListener('change', (e) => changeLanguage(e.target.value));
    themeToggleBtn.addEventListener('click', toggleTheme);
    favoritesLinkEl.addEventListener('click', toggleFavoritesModal);
    closeModalBtn.addEventListener('click', toggleFavoritesModal);
    categorySelectEl.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        localStorage.setItem('category', currentCategory);
        generateQuote();
    });
    
    // Close modal when clicking outside
    favoritesModalEl.addEventListener('click', (e) => {
        if (e.target === favoritesModalEl) {
            toggleFavoritesModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !favoritesModalEl.classList.contains('hidden')) {
            toggleFavoritesModal();
        }
    });
}

