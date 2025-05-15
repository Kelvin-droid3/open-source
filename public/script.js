// DOM Elements
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteTags = document.getElementById('quoteTags');
const newQuoteBtn = document.getElementById('newQuote');
const favouriteBtn = document.getElementById('favouriteBtn');
const themeToggleBtn = document.getElementById('themeToggle');
<<<<<<< HEAD
const favoritesLinkEl = document.getElementById('favoritesLink');
const favoritesModalEl = document.getElementById('favoritesModal');
const closeModalBtn = document.querySelector('.close-modal');
const favoritesListEl = document.getElementById('favoritesList');
const categorySelectEl = document.getElementById('categorySelect');
=======
const favouritesGrid = document.getElementById('favourites-grid');
const copyBtn = document.getElementById('copyBtn');
>>>>>>> d2e31c017f92a18d024bad322313e35f2bdbb47d

let currentQuote = {};
<<<<<<< HEAD
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
=======
let isFavourite = false;

// Theme Management
>>>>>>> d2e31c017f92a18d024bad322313e35f2bdbb47d
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.innerHTML = theme === 'dark' 
        ? '<i class="fas fa-sun"></i> Light Mode' 
        : '<i class="fas fa-moon"></i> Dark Mode';
}

// Quote Functionality
async function getRandomQuote() {
    try {
        const response = await fetch('http://localhost:3000/random');
        if (!response.ok) throw new Error('Network error');
        currentQuote = await response.json();
        
        updateDisplay();
        await checkFavouriteStatus();
    } catch (error) {
        console.error('Error:', error);
        if (quoteText) quoteText.textContent = 'Failed to load quote. Please try again.';
    }
}

function updateDisplay() {
    if (!quoteText || !quoteAuthor || !quoteTags) return;
    
    quoteText.textContent = `"${currentQuote.quote}"`;
    quoteAuthor.textContent = `— ${currentQuote.author}`;
    quoteTags.innerHTML = currentQuote.tags.map(tag => 
        `<span class="tag">#${tag}</span>`
    ).join(' ');
}

// Unified Clipboard Functionality
function copyQuoteToClipboard(quote, author) {
    const textToCopy = quote ? `"${quote}" — ${author}` : `"${currentQuote.quote}" — ${currentQuote.author}`;
    
    if (!textToCopy || textToCopy === '"undefined" — undefined') {
        showFeedback('No quote to copy!');
        return;
    }

    navigator.clipboard.writeText(textToCopy)
        .then(() => showFeedback('Quote copied to clipboard!'))
        .catch(err => {
            console.error('Copy failed:', err);
            showFeedback('Failed to copy quote');
        });
}

// Favourites Functionality
async function toggleFavourite(e) {
    if (e) e.preventDefault();
    try {
        const response = await fetch('http://localhost:3000/favourites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quote: currentQuote.quote,
                author: currentQuote.author,
                tags: currentQuote.tags
            })
        });

        if (!response.ok) throw new Error('Failed to toggle favourite');
        
        const result = await response.json();
        showFeedback(result.message);
        await checkFavouriteStatus();
    } catch (error) {
        console.error('Favourite error:', error);
        showFeedback('Failed to update favourite');
    }
}

async function checkFavouriteStatus() {
    try {
        const response = await fetch('http://localhost:3000/favourites');
        if (!response.ok) throw new Error('Failed to fetch favourites');
        
        const favourites = await response.json();
        isFavourite = favourites.some(fav => 
            fav.quote === currentQuote.quote && 
            fav.author === currentQuote.author
        );
        
        if (favouriteBtn) {
            favouriteBtn.innerHTML = isFavourite 
                ? '<i class="fas fa-heart"></i> Remove Favourite' 
                : '<i class="far fa-heart"></i> Add Favourite';
        }
    } catch (error) {
        console.error('Favourite check error:', error);
    }
}

async function removeFavourite(quote, author) {
    try {
        const response = await fetch('http://localhost:3000/favourites', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quote, author })
        });

        const responseText = await response.text();
        if (!response.ok) {
            let errorMessage = 'Failed to remove favourite';
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                errorMessage = responseText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const result = JSON.parse(responseText);
        showFeedback(result.message);
        return true;
    } catch (error) {
        console.error('Error:', error);
        showFeedback(error.message);
        return false;
    }
}

async function loadFavourites() {
    try {
        const response = await fetch('http://localhost:3000/favourites');
        if (!response.ok) throw new Error('Failed to load favourites');
        
        const favourites = await response.json();
        if (!favouritesGrid) return;

        favouritesGrid.innerHTML = favourites.length === 0 
            ? '<p class="empty-state"><i class="fas fa-info-circle"></i> No favourites yet. Add some from the main page!</p>'
            : favourites.map(quote => `
                <div class="favourite-card">
                    <button class="remove-btn action-btn icon" 
                            data-quote="${encodeURIComponent(quote.quote)}" 
                            data-author="${encodeURIComponent(quote.author)}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <p class="quote"> "${quote.quote}"</p>
                    <p class="author">— ${quote.author}</p>
                    <div class="tags">${(quote.tags || []).map(t => 
                        `<span class="tag">#${t}</span>`
                    ).join(' ')}</div>
                    <div class="favourite-actions-bottom">
                        <button class="copy-btn action-btn icon" 
                                data-quote="${encodeURIComponent(quote.quote)}" 
                                data-author="${encodeURIComponent(quote.author)}"
                                title="Copy quote">
                            <i class="far fa-copy"></i>
                        </button>
                    </div>
                </div>
            `).join('');

        // Unified copy functionality
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const quote = decodeURIComponent(btn.dataset.quote);
                const author = decodeURIComponent(btn.dataset.author);
                copyQuoteToClipboard(quote, author);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const card = btn.closest('.favourite-card');
                const quote = decodeURIComponent(btn.dataset.quote);
                const author = decodeURIComponent(btn.dataset.author);
                
                if (await removeFavourite(quote, author)) {
                    card.remove();
                    if (!document.querySelector('.favourite-card')) {
                        favouritesGrid.innerHTML = '<p class="empty-state"><i class="fas fa-info-circle"></i> No favourites yet. Add some from the main page!</p>';
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error:', error);
        if (favouritesGrid) {
            favouritesGrid.innerHTML = `
                <p class="error-state">
                    <i class="fas fa-exclamation-triangle"></i> 
                    ${error.message}
                </p>`;
        }
    }
}

// Helper Functions
function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.textContent = message;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
}

<<<<<<< HEAD
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

=======
// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);

    if (favouritesGrid) {
        loadFavourites();
    } else if (quoteText) {
        getRandomQuote();
        newQuoteBtn?.addEventListener('click', getRandomQuote);
        favouriteBtn?.addEventListener('click', toggleFavourite);
        copyBtn?.addEventListener('click', () => copyQuoteToClipboard());
    }

    themeToggleBtn?.addEventListener('click', toggleTheme);
});
>>>>>>> d2e31c017f92a18d024bad322313e35f2bdbb47d
