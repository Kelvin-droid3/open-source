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

// Debug configuration
const DEBUG = {
    SHOW_QUOTE_DETAILS: true,
    SHOW_TAG_DETAILS: true,
    SHOW_STATS: true
};

// Type validation
function validateValue(value, expectedType, fieldName, index) {
    if (typeof value !== expectedType) {
        throw new Error(
            `Invalid type for ${fieldName} in quote #${index + 1}\n` +
            `Expected ${expectedType}, got ${typeof value}\n` +
            `Full value: ${JSON.stringify(value)}`
        );
    }
}

try {
    console.log('Starting database initialisation...\n');

    // Drop and recreate tables
    console.log('Cleaning existing tables...');
    db.exec(`
        DROP TABLE IF EXISTS quote_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS quotes;
    `);

    console.log('Creating new schema...');
    db.exec(`
        CREATE TABLE quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote TEXT NOT NULL,
            author TEXT NOT NULL DEFAULT 'Unknown'
        );
        
        CREATE TABLE tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE COLLATE NOCASE
        );
        
        CREATE TABLE quote_tags (
            quote_id INTEGER,
            tag_id INTEGER,
            PRIMARY KEY (quote_id, tag_id),
            FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );
    `);

    // Create indexes
    console.log('Creating indexes...');
    db.exec('CREATE INDEX IF NOT EXISTS idx_author ON quotes (author)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_tag_name ON tags (name)');

    // Load quotes data
    console.log('\nLoading quotes data...');
    if (!fs.existsSync(JSON_PATH)) {
        throw new Error(`Missing quotes.json at ${JSON_PATH}`);
    }
    const quotes = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    
    if (!Array.isArray(quotes)) {
        throw new Error('quotes.json should contain an array of quote objects');
    }

    // Prepare statements
    const insertQuote = db.prepare(`
        INSERT INTO quotes (quote, author)
        VALUES (@quote, @author)
    `);
    
    const insertTag = db.prepare(`
        INSERT OR IGNORE INTO tags (name)
        VALUES (@name)
    `);
    
    const getTagId = db.prepare(`
        SELECT id FROM tags WHERE name = @name
    `).pluck();
    
    const linkTag = db.prepare(`
        INSERT INTO quote_tags (quote_id, tag_id)
        VALUES (@quote_id, @tag_id)
    `);

    // Initialise statistics
    let tagStats = {
        totalAssignments: 0,
        tagCounts: new Map(),
        quotesWithTags: 0,
        quotesWithoutTags: 0
    };

    console.log(`\nProcessing ${quotes.length} quotes...`);
    const progressInterval = setInterval(() => {
        process.stdout.write('.');
    }, 100);

    // Process quotes in transaction
    db.transaction(() => {
        quotes.forEach((quoteData, index) => {
            try {
                const quoteNum = index + 1;
                if (DEBUG.SHOW_QUOTE_DETAILS) {
                    console.log(`\nQuote #${quoteNum} [${quoteData.author}]`);
                    console.log(`   ${quoteData.quote}`);
                }

                // Validate required fields
                if (!('quote' in quoteData)) throw new Error(`Missing 'quote' field in entry ${quoteNum}`);
                if (!('author' in quoteData)) throw new Error(`Missing 'author' field in entry ${quoteNum}`);

                // Insert quote
                const quoteParams = {
                    quote: String(quoteData.quote),
                    author: String(quoteData.author || 'Unknown')
                };
                
                validateValue(quoteParams.quote, 'string', 'quote', index);
                validateValue(quoteParams.author, 'string', 'author', index);
                
                const { lastInsertRowid: quoteId } = insertQuote.run(quoteParams);

                // Process tags
                const tags = Array.isArray(quoteData.tags) 
                    ? quoteData.tags.filter(t => typeof t === 'string' && t.trim() !== '')
                    : [];

                if (tags.length > 0) {
                    tagStats.quotesWithTags++;
                    if (DEBUG.SHOW_TAG_DETAILS) {
                        console.log(`   Tags: ${tags.join(', ')}`);
                    }
                } else {
                    tagStats.quotesWithoutTags++;
                    if (DEBUG.SHOW_TAG_DETAILS) {
                        console.log('   No tags specified');
                    }
                }

                tags.forEach(tagName => {
                    const normalisedTag = tagName.trim().toLowerCase();
                    insertTag.run({ name: normalisedTag });
                    const tagId = getTagId.get({ name: normalisedTag });
                    linkTag.run({ quote_id: quoteId, tag_id: tagId });
                    
                    // Update statistics
                    tagStats.totalAssignments++;
                    tagStats.tagCounts.set(normalisedTag, 
                        (tagStats.tagCounts.get(normalisedTag) || 0) + 1
                    );
                });

            } catch (error) {
                console.error(`\nError processing quote #${index + 1}:`);
                console.error(JSON.stringify(quoteData, null, 2));
                throw error;
            }
        });
    })();

    clearInterval(progressInterval);
    console.log('\n\nSuccessfully processed all quotes!');

    // Generate statistics
    if (DEBUG.SHOW_STATS) {
        const uniqueTagsCount = db.prepare('SELECT COUNT(*) FROM tags').pluck().get();
        
        console.log('\nStatistics:');
        console.log(`   Total quotes processed: ${quotes.length}`);
        console.log(`   Quotes with tags: ${tagStats.quotesWithTags} (${Math.round((tagStats.quotesWithTags / quotes.length) * 100)}%)`);
        console.log(`   Quotes without tags: ${tagStats.quotesWithoutTags}`);
        console.log(`   Unique tags created: ${uniqueTagsCount}`);
        console.log(`   Total tag assignments: ${tagStats.totalAssignments}`);
        
        const sortedTags = [...tagStats.tagCounts.entries()]
            .sort((a, b) => b[1] - a[1]);
        
        console.log('\nTag Usage Distribution:');
        sortedTags.slice(0, 5).forEach(([tag, count], index) => {
            console.log(`   ${index + 1}. ${tag} (${count} quotes)`);
        });
    }

} catch (error) {
    console.error('\nInitialisation failed:', error.message);
    process.exit(1);

} finally {
    db.close();
}
