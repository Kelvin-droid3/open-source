const express = require('express');
const Database = require('better-sqlite3');
const app = express();
const PORT = 3000;
const cors = require('cors');

<<<<<<< HEAD
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
// Initialise database connection
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Precompute available categories at startup
let availableCategories = [];
let totalQuotes = 0;

try {
    availableCategories = db.prepare(`
        SELECT DISTINCT LOWER(category) as category 
        FROM quotes
    `).all().map(row => row.category);
    
    totalQuotes = db.prepare('SELECT COUNT(*) as total FROM quotes').get().total;
=======

// Initialise database connection
const db = new Database('./db/quotes.db', { 
    verbose: console.log,
    fileMustExist: true  // Ensures database exists before starting
});


// Add JSON body parsing middleware
app.use(express.json());

// Enable CORS for all origins
app.use(cors());

// Precompute available tags at startup
let availableTags = [];
let totalQuotes = 0;

try {
    // Get all unique tags
    availableTags = db.prepare(`
        SELECT name FROM tags ORDER BY name
    `).all().map(row => row.name);
    
    totalQuotes = db.prepare('SELECT COUNT(*) FROM quotes').pluck().get();
>>>>>>> e7c96cae556c2a726309e1290d699576ec3e5656
} catch (error) {
    console.error('Database initialisation error:', error);
    process.exit(1);
}

<<<<<<< HEAD
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
=======
// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

>>>>>>> e7c96cae556c2a726309e1290d699576ec3e5656
// Get random quote endpoint
app.get('/random', (req, res) => {
    try {
        const stmt = db.prepare(`
<<<<<<< HEAD
            SELECT * FROM quotes 
            LIMIT 1 OFFSET ABS(RANDOM() % ?)
        `);
        const quote = stmt.get(totalQuotes);
        quote ? res.json(quote) : res.status(404).json({ error: 'No quotes found' });
    } catch (error) {
=======
            SELECT 
                q.quote, 
                q.author,
                JSON_GROUP_ARRAY(t.name) AS tags
            FROM quotes q
            LEFT JOIN quote_tags qt ON q.id = qt.quote_id
            LEFT JOIN tags t ON qt.tag_id = t.id
            GROUP BY q.id
            ORDER BY RANDOM()
            LIMIT 1
        `);
        
        const quote = stmt.get();
        if (!quote) return res.status(404).json({ error: 'No quotes found' });
        
        quote.tags = JSON.parse(quote.tags || '[]');
        res.json(quote);
    } catch (error) {
        console.error('Database Error:', error);
>>>>>>> e7c96cae556c2a726309e1290d699576ec3e5656
        res.status(500).json({ error: 'Failed to fetch random quote' });
    }
});

<<<<<<< HEAD
// Get random quote by category endpoint
app.get('/random/:category', (req, res) => {
    const category = req.params.category.toLowerCase();
    
    if (!availableCategories.includes(category)) {
        return res.status(400).json({
            error: 'Invalid category',
            availableCategories: availableCategories.join(', ')
=======
// Get random quote by tag endpoint
app.get('/random/tag/:tag', (req, res) => {
    const requestedTag = req.params.tag.toLowerCase();
    
    if (!availableTags.includes(requestedTag)) {
        return res.status(400).json({
            error: 'Invalid tag requested',
            availableTags,
            suggestion: 'Use exact tag name from /tags endpoint'
>>>>>>> e7c96cae556c2a726309e1290d699576ec3e5656
        });
    }

    try {
        const stmt = db.prepare(`
<<<<<<< HEAD
            SELECT * FROM quotes 
            WHERE LOWER(category) = ? 
            LIMIT 1 OFFSET ABS(RANDOM() % (
                SELECT COUNT(*) FROM quotes WHERE LOWER(category) = ?
            ))
        `);
        const quote = stmt.get(category, category);
        quote ? res.json(quote) : res.status(404).json({ error: 'No quotes found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category quote' });
    }
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
    console.log(`Available categories: ${availableCategories.join(', ')}`);
=======
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
        if (!quote) return res.status(404).json({ error: 'No quotes found for tag' });
        
        quote.tags = JSON.parse(quote.tags);
        res.json(quote);
    } catch (error) {
        console.error('Tagged quote error:', error);
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

// ================== Favourites Endpoints ================== //
app.post('/favourites', (req, res) => {
    try {
        const { quote, author, tags } = req.body;
        
        if (!quote?.trim() || !author?.trim()) {
            return res.status(400).json({ 
                error: 'Missing required fields: quote and author' 
            });
        }

        const insert = db.prepare(`
            INSERT INTO favourites (quote, author, tags)
            VALUES (?, ?, ?)
        `);
        
        const result = insert.run(
            quote.trim(),
            author.trim(),
            JSON.stringify(tags || [])
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Favourite added successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Favourite addition error:', error);
        res.status(500).json({ 
            error: 'Failed to add favourite',
            details: error.message
        });
    }
});

app.get('/favourites', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT id, quote, author, tags, 
                   strftime('%Y-%m-%dT%H:%M:%SZ', created_at) AS created_at
            FROM favourites
            ORDER BY created_at DESC
        `);
        
        const favourites = stmt.all().map(fav => ({
            ...fav,
            tags: JSON.parse(fav.tags)
        }));

        res.json(favourites);
    } catch (error) {
        console.error('Favourites retrieval error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve favourites',
            details: error.message
        });
    }
});


app.delete('/favourites', (req, res) => {
    try {
        const { quote, author } = req.body;
        
        // Validate request body
        if (!quote || typeof quote !== 'string' || 
            !author || typeof author !== 'string') {
            return res.status(400).json({ 
                error: 'Invalid request format' 
            });
        }

        const cleanQuote = quote.trim();
        const cleanAuthor = author.trim();

        const stmt = db.prepare(`
            DELETE FROM favourites 
            WHERE quote = ? AND author = ?
        `);
        
        const result = stmt.run(cleanQuote, cleanAuthor);
        
        if (result.changes === 0) {
            return res.status(404).json({ 
                error: 'Favourite not found' 
            });
        }

        res.json({
            message: 'Favourite removed successfully',
            changes: result.changes
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ 
            error: 'Failed to remove favourite',
            details: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Total quotes available: ${totalQuotes}`);
    console.log(`Available tags (${availableTags.length}):\n- ${availableTags.join('\n- ')}`);
>>>>>>> e7c96cae556c2a726309e1290d699576ec3e5656
});
