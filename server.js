const express = require('express');
const Database = require('better-sqlite3');
const app = express();
const PORT = 3000;
const cors = require('cors');

// Database configuration
const db = new Database('db/quotes.db');

// Enable CORS for all origins
app.use(cors());
app.use(express.static('public'));

let quotes = [];
try {
    const data = fs.readFileSync('quotes.json', 'utf8');
    quotes = JSON.parse(data);
} catch (error) {
    console.error('Error loading quotes:', error);
}

const availableLanguages = ['en', 'es', 'fr', 'ja', 'ga'];
// Precompute available tags at startup
let availableTags = [];
let totalQuotes = 0;

try {
    // Get all unique tags
    availableTags = db.prepare(`
        SELECT name FROM tags ORDER BY name
    `).all().map(row => row.name);
    
    totalQuotes = db.prepare('SELECT COUNT(*) FROM quotes').pluck().get();
} catch (error) {
    console.error('Database initialisation error:', error);
    process.exit(1);
}

app.get('/random/:lang?', (req, res) => {
    const lang = req.params.lang || 'en';
    
    if (!availableLanguages.includes(lang)) {
        return res.status(400).json({ error: 'Unsupported language' });
    }

    if (quotes.length === 0) {
        return res.status(500).json({ error: 'No quotes available' });
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex][lang] || quotes[randomIndex]['en'];
    res.json(quote);
});

app.get('/random/:lang/:category', (req, res) => {
    const lang = req.params.lang || 'en';
    const category = req.params.category.toLowerCase();

    if (!availableLanguages.includes(lang)) {
        return res.status(400).json({ error: 'Unsupported language' });
    }

    const filteredQuotes = quotes
        .map(q => q[lang] || q['en'])
        .filter(q => q.category.toLowerCase() === category);

    if (filteredQuotes.length === 0) {
        const categories = [...new Set(quotes.map(q => (q[lang] || q['en']).category.toLowerCase()))];
        return res.status(404).json({ 
            error: `Invalid category. Available categories: ${categories.join(', ')}` 
        });
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    res.json(filteredQuotes[randomIndex]);
// Get random quote endpoint
app.get('/random', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT 
                q.quote, 
                q.author,
                JSON_GROUP_ARRAY(t.name) AS tags
            FROM quotes q
            LEFT JOIN quote_tags qt ON q.id = qt.quote_id
            LEFT JOIN tags t ON qt.tag_id = t.id
            GROUP BY q.id
            LIMIT 1 OFFSET ABS(RANDOM() % ?)
        `);
        
        const quote = stmt.get(totalQuotes);
        quote.tags = JSON.parse(quote.tags || '[]'); // Convert JSON string to array
        
        quote ? res.json(quote) : res.status(404).json({ error: 'No quotes found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch random quote' });
    }
});

// Get random quote by tag endpoint
app.get('/random/tag/:tag', (req, res) => {
    const requestedTag = req.params.tag.toLowerCase();
    
    if (!availableTags.includes(requestedTag)) {
        return res.status(400).json({
            error: 'Invalid tag requested',
            availableTags: availableTags,
            suggestion: 'Use exact tag name from /tags endpoint'
        });
    }

    try {
        const stmt = db.prepare(`
            SELECT 
                q.quote,
                q.author,
                JSON_GROUP_ARRAY(t.name) AS tags
            FROM quotes q
            JOIN quote_tags qt ON q.id = qt.quote_id
            JOIN tags t ON qt.tag_id = t.id
            WHERE t.name = ?
            GROUP BY q.id
            LIMIT 1 OFFSET ABS(RANDOM() % (
                SELECT COUNT(DISTINCT q.id)
                FROM quotes q
                JOIN quote_tags qt ON q.id = qt.quote_id
                JOIN tags t ON qt.tag_id = t.id
                WHERE t.name = ?
            ))
        `);

        const quote = stmt.get(requestedTag, requestedTag);
        if (quote) {
            quote.tags = JSON.parse(quote.tags);
            res.json(quote);
        } else {
            res.status(404).json({ error: 'No quotes found for tag' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tagged quote' });
    }
});

// Get all available tags
app.get('/tags', (req, res) => {
    res.json({
        count: availableTags.length,
        tags: availableTags
    });
});

app.get('/categories/:lang?', (req, res) => {
    const lang = req.params.lang || 'en';
    const categories = [...new Set(quotes.map(q => (q[lang] || q['en']).category))];
    res.json(categories);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Total quotes available: ${totalQuotes}`);
    console.log(`Available tags (${availableTags.length}):\n- ${availableTags.join('\n- ')}`);
});
