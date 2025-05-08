const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const DEBUG = require('./config.json');
const TABLES = require('./schema.js').TABLES;

const DB_DIR = path.join(process.cwd(), 'db');
const DB_PATH = path.join(DB_DIR, 'quotes.db');
const JSON_PATH = path.join(DB_DIR, 'quotes.json');

const db = new Database(DB_PATH);

function removeExistingTables(db) {
    db.exec(`
        DROP TABLE IF EXISTS quote_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS quotes;
    `);
}

function createSchema(db) {
    db.exec(`
        CREATE TABLE quotes (
            ${TABLES.quotes.ID} INTEGER PRIMARY KEY AUTOINCREMENT,
            ${TABLES.quotes.QUOTE} TEXT NOT NULL,
            ${TABLES.quotes.AUTHOR} TEXT NOT NULL DEFAULT 'Unknown'
        );
        
        CREATE TABLE tags (
            ${TABLES.tags.ID} INTEGER PRIMARY KEY AUTOINCREMENT,
            ${TABLES.tags.NAME} TEXT NOT NULL UNIQUE COLLATE NOCASE
        );
        
        CREATE TABLE quote_tags (
            ${TABLES.quote_tags.QUOTE_ID} INTEGER,
            ${TABLES.quote_tags.TAG_ID} INTEGER,
            PRIMARY KEY (${TABLES.quote_tags.QUOTE_ID}, ${TABLES.quote_tags.TAG_ID}),
            FOREIGN KEY (${TABLES.quote_tags.QUOTE_ID}) REFERENCES quotes(${TABLES.quotes.ID}) ON DELETE CASCADE,
            FOREIGN KEY (${TABLES.quote_tags.TAG_ID}) REFERENCES tags(${TABLES.tags.ID}) ON DELETE CASCADE
        );
    `);
}

function loadQuotes() {
    const quotes = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    if (!Array.isArray(quotes)) {
        throw new Error('quotes.json should contain an array of quote objects');
    }
    return quotes;
}

function validateValue(value, expectedType, fieldName, index) {
  if (typeof value !== expectedType) {
    throw new Error(
      `Invalid type for ${fieldName} in quote #${index + 1}\n` +
      `Expected ${expectedType}, got ${typeof value}\n` +
      `Full value: ${JSON.stringify(value)}`
    );
  }
}

if (!fs.existsSync(JSON_PATH)) {
    throw new Error(`Missing quotes.json at ${JSON_PATH}`);
}

// Main initialise sequence
try {
  console.log('Starting database initialisation…\n');

    console.log('Cleaning existing tables...');
    removeExistingTables(db)

    console.log('Creating new schema...');
    createSchema(db)

    console.log('Creating indexes...');
    db.exec('CREATE INDEX IF NOT EXISTS idx_author ON quotes (author)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_tag_name ON tags (name)');

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

    console.log('\nLoading quotes data...');
    const quotes = loadQuotes()

    // Initialise statistics
    let tagStats = {
        totalAssignments: 0,
        tagCounts: new Map(),
        quotesWithTags: 0,
        quotesWithoutTags: 0
    };

  console.log(`\nProcessing ${quotes.length} quotes…`);
  const progress = setInterval(() => process.stdout.write('.'), 100);

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

  clearInterval(progress);
  console.log('\n\nSuccessfully processed all quotes!');

  // Show statistics if enabled
  if (DEBUG.SHOW_STATS) {
    const uniqueTagCount = db.prepare('SELECT COUNT(*) FROM tags').pluck().get();
    console.log('\nStatistics:');
    console.log(`  Total quotes processed: ${quotes.length}`);
    console.log(`  With tags: ${tagStats.quotesWithTags}`);
    console.log(`  Without tags: ${tagStats.quotesWithoutTags}`);
    console.log(`  Unique tags created: ${uniqueTagCount}`);
    console.log(`  Total tag assignments: ${tagStats.totalAssignments}`);
    const sorted = [...tagStats.tagCounts.entries()].sort((a,b) => b[1]-a[1]);
    console.log('\nTop 5 tags:');
    sorted.slice(0,5).forEach(([tag, count], i) => {
      console.log(`  ${i+1}. ${tag} (${count})`);
    });
  }

} catch (error) {
    console.error('\nInitialisation failed:', error.message);
    process.exit(1);

} finally {
  db.close();
}
