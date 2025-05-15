// DOM Elements
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteTags = document.getElementById('quoteTags');
const newQuoteBtn = document.getElementById('newQuote');
const favouriteBtn = document.getElementById('favouriteBtn');
const themeToggleBtn = document.getElementById('themeToggle');
const favouritesGrid = document.getElementById('favourites-grid');
const copyBtn = document.getElementById('copyBtn');

let currentQuote = {};
let isFavourite = false;

// Theme Management
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
