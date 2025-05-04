const express = require('express');
const Database = require('better-sqlite3');
const app = express();
const PORT = 3000;
const cors = require('cors');

// Database configuration
const db = new Database('db/quotes.db');

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Total quotes available: ${totalQuotes}`);
    console.log(`Available tags (${availableTags.length}):\n- ${availableTags.join('\n- ')}`);
});
