const express = require('express');
const Database = require('better-sqlite3');
const app = express();
const PORT = 3000;
const cors = require('cors');

// Database configuration
const db = new Database('db/quotes.db');

// Enable CORS for all origins
app.use(cors());

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
} catch (error) {
    console.error('Database initialisation error:', error);
    process.exit(1);
}

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Get random quote endpoint
app.get('/random', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT * FROM quotes 
            LIMIT 1 OFFSET ABS(RANDOM() % ?)
        `);
        const quote = stmt.get(totalQuotes);
        quote ? res.json(quote) : res.status(404).json({ error: 'No quotes found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch random quote' });
    }
});

// Get random quote by category endpoint
app.get('/random/:category', (req, res) => {
    const category = req.params.category.toLowerCase();
    
    if (!availableCategories.includes(category)) {
        return res.status(400).json({
            error: 'Invalid category',
            availableCategories: availableCategories.join(', ')
        });
    }

    try {
        const stmt = db.prepare(`
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Total quotes available: ${totalQuotes}`);
    console.log(`Available categories: ${availableCategories.join(', ')}`);
});
