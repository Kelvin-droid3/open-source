const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Configure paths
const PROJECT_ROOT = process.cwd();
const DB_DIR = path.join(PROJECT_ROOT, 'db');
const DB_PATH = path.join(DB_DIR, 'quotes.db');
const JSON_PATH = path.join(DB_DIR, 'quotes.json');

// Create db directory if needed
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialise database
const db = new Database(DB_PATH);

try {
    // Create table structure
    db.exec(`
        CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote TEXT NOT NULL,
            author TEXT NOT NULL DEFAULT 'Unknown',
            category TEXT NOT NULL,
            title TEXT
        );
    `);

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_category ON quotes (category)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_author ON quotes (author)');

    // Verify JSON file exists
    if (!fs.existsSync(JSON_PATH)) {
        throw new Error(`Missing quotes.json file at: ${JSON_PATH}`);
    }

    // Load and parse quotes
    const rawData = fs.readFileSync(JSON_PATH, 'utf8');
    const quotes = JSON.parse(rawData);

    if (!Array.isArray(quotes)) {
        throw new Error('Invalid JSON format - expected array of quote objects');
    }

    // Clear existing data
    db.exec('DELETE FROM quotes');

    // Insert new quotes
    const insert = db.prepare(`
        INSERT INTO quotes (quote, author, category, title)
        VALUES (@quote, @author, @category, @title)
    `);

    db.transaction(() => {
        quotes.forEach(quote => {
            insert.run({
                quote: quote.quote,
                author: quote.author || 'Unknown',
                category: (quote.category || 'general').toLowerCase(),
                title: quote.title || quote.Title || ''
            });
        });
    })();

    console.log('Database successfully initialised!');
    console.log(`Database path: ${DB_PATH}`);
    console.log(`Quotes inserted: ${quotes.length}`);
    console.log(`Database size: ${(fs.statSync(DB_PATH).size / 1024).toFixed(1)} KB`);

} catch (error) {
    console.error('Initialisation failed:');
    console.error(error.message);
    process.exit(1);

} finally {
    db.close();
}
