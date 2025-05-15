const Database = require('better-sqlite3');
<<<<<<< HEAD
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
=======
const fs       = require('fs');
const path     = require('path');
const DEBUG    = require('./config.json');
const { TABLES } = require('./schema.js');

const DB_DIR    = path.join(process.cwd(), 'db');
const DB_PATH   = path.join(DB_DIR, 'quotes.db');
const JSON_PATH = path.join(DB_DIR, 'quotes.json');

const db = new Database(DB_PATH);

// Drop all existing tables
function removeExistingTables(db) {
  db.exec(`
    DROP TABLE IF EXISTS ${TABLES.favourites ? 'favourites' : 'favourites'};
    DROP TABLE IF EXISTS ${TABLES.tag_synonyms ? 'tag_synonyms' : 'tag_synonyms'};
    DROP TABLE IF EXISTS ${TABLES.quote_tags ? 'quote_tags' : 'quote_tags'};
    DROP TABLE IF EXISTS ${TABLES.tags       ? 'tags'       : 'tags'};
    DROP TABLE IF EXISTS ${TABLES.quotes     ? 'quotes'     : 'quotes'};
  `);
}

// Create schema for quotes, tags, quote_tags, tag_synonyms and favourites
function createSchema(db) {
  db.exec(`
    CREATE TABLE quotes (
      ${TABLES.quotes.ID}     INTEGER PRIMARY KEY AUTOINCREMENT,
      ${TABLES.quotes.QUOTE}  TEXT    NOT NULL,
      ${TABLES.quotes.AUTHOR} TEXT    NOT NULL DEFAULT 'Unknown'
    );

    CREATE TABLE tags (
      ${TABLES.tags.ID}   INTEGER PRIMARY KEY AUTOINCREMENT,
      ${TABLES.tags.NAME} TEXT    NOT NULL UNIQUE COLLATE NOCASE
    );

    CREATE TABLE quote_tags (
      ${TABLES.quote_tags.QUOTE_ID} INTEGER,
      ${TABLES.quote_tags.TAG_ID}   INTEGER,
      PRIMARY KEY (
        ${TABLES.quote_tags.QUOTE_ID},
        ${TABLES.quote_tags.TAG_ID}
      ),
      FOREIGN KEY (${TABLES.quote_tags.QUOTE_ID}) REFERENCES quotes(${TABLES.quotes.ID}) ON DELETE CASCADE,
      FOREIGN KEY (${TABLES.quote_tags.TAG_ID})   REFERENCES tags(${TABLES.tags.ID})   ON DELETE CASCADE
    );

    CREATE TABLE tag_synonyms (
      ${TABLES.tag_synonyms.VARIANT}   TEXT PRIMARY KEY,
      ${TABLES.tag_synonyms.CANONICAL} TEXT NOT NULL,
      FOREIGN KEY (${TABLES.tag_synonyms.CANONICAL}) REFERENCES tags(${TABLES.tags.NAME}) ON DELETE CASCADE
    );

    CREATE TABLE favourites (
      ${TABLES.favourites.ID}         INTEGER PRIMARY KEY AUTOINCREMENT,
      ${TABLES.favourites.QUOTE}      TEXT    NOT NULL,
      ${TABLES.favourites.AUTHOR}     TEXT    NOT NULL DEFAULT 'Unknown',
      ${TABLES.favourites.TAGS}       TEXT    NOT NULL,
      ${TABLES.favourites.CREATED_AT} TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Load and validate quotes.json
function loadQuotes() {
  if (!fs.existsSync(JSON_PATH)) {
    throw new Error(`Missing quotes.json at ${JSON_PATH}`);
  }
  const data = fs.readFileSync(JSON_PATH, 'utf8');
  const quotes = JSON.parse(data);
  if (!Array.isArray(quotes)) {
    throw new Error('quotes.json should contain an array of quote objects');
  }
  return quotes;
}

// Tag normalisation mapping
const TAG_MAPPINGS = {
  live:          'life',
  miracles:      'miracle',
  humor:         'humour',
  friends:       'friendship',
  plans:         'planning',
  lies:          'lying',
  dreamers:      'dreams',
  dreaming:      'dreams',
  'fairy-tales': 'fairytales',
  inspiration:   'inspirational',
  romantic:      'romance',
  read:          'reading',
  understand:    'understanding',
  write:         'writing'
};

// Validate field types
function validateValue(value, expectedType, fieldName, index) {
  if (typeof value !== expectedType) {
    throw new Error(
      `Invalid type for ${fieldName} in quote #${index + 1}\n` +
      `Expected ${expectedType}, got ${typeof value}\n` +
      `Full value: ${JSON.stringify(value)}`
    );
  }
}

// Main initialisation
try {
  console.log('Starting database initialisation…\n');

  console.log('Cleaning existing tables…');
  removeExistingTables(db);

  console.log('Creating new schema…');
  createSchema(db);

  console.log('Creating indexes…');
  db.exec('CREATE INDEX IF NOT EXISTS idx_author   ON quotes(author)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_tag_name ON tags(name)');

  // Prepare statements
  const insertQuote   = db.prepare(`INSERT INTO quotes (quote, author) VALUES (@quote, @author)`);
  const insertTag     = db.prepare(`INSERT OR IGNORE INTO tags (name) VALUES (@name)`);
  const getTagId      = db.prepare(`SELECT id FROM tags WHERE name = @name`).pluck();
  const linkTag       = db.prepare(`INSERT OR IGNORE INTO quote_tags (quote_id, tag_id) VALUES (@quote_id, @tag_id)`);
  const insertSynonym = db.prepare(`INSERT INTO tag_synonyms (variant, canonical) VALUES (@variant, @canonical)`);

  console.log('\nLoading quotes data…');
  const quotes = loadQuotes();

  // Statistics
  const tagStats = {
    totalAssignments: 0,
    tagCounts: new Map(),
    quotesWithTags: 0,
    quotesWithoutTags: 0
  };

  console.log(`\nProcessing ${quotes.length} quotes…`);
  const prog = setInterval(() => process.stdout.write('.'), 100);

  db.transaction(() => {
    // Seed canonical tags & synonyms
    const canonicals = Array.from(new Set(Object.values(TAG_MAPPINGS)));
    canonicals.forEach(name => insertTag.run({ name }));
    Object.entries(TAG_MAPPINGS).forEach(([variant, canonical]) =>
      insertSynonym.run({ variant, canonical })
    );

    // Insert quotes + tags
    quotes.forEach((qd, idx) => {
      // Validate
      if (!('quote' in qd))  throw new Error(`Missing 'quote' in entry #${idx+1}`);
      if (!('author' in qd)) throw new Error(`Missing 'author' in entry #${idx+1}`);

      const text   = String(qd.quote);
      const author = String(qd.author || 'Unknown');
      validateValue(text, 'string', 'quote', idx);
      validateValue(author, 'string', 'author', idx);

      // Insert quote
      const { lastInsertRowid: quoteId } = insertQuote.run({ quote: text, author });

      // Process tags
      const raw = Array.isArray(qd.tags) ? qd.tags : [];
      const uniq = new Set();
      raw.forEach(t => {
        if (typeof t === 'string' && t.trim()) {
          let n = t.trim().toLowerCase();
          if (TAG_MAPPINGS[n]) n = TAG_MAPPINGS[n];
          uniq.add(n);
        }
      });

      if (uniq.size) tagStats.quotesWithTags++;
      else           tagStats.quotesWithoutTags++;

      uniq.forEach(name => {
        insertTag.run({ name });
        const tagId = getTagId.get({ name });
        linkTag.run({ quote_id: quoteId, tag_id: tagId });
        tagStats.totalAssignments++;
        tagStats.tagCounts.set(name, (tagStats.tagCounts.get(name) || 0) + 1);
      });
    });
  })();

  clearInterval(prog);
  console.log('\n\nAll quotes processed successfully!');

  if (DEBUG.SHOW_STATS) {
    const uniqueCount = db.prepare('SELECT COUNT(*) FROM tags').pluck().get();
    console.log('\nStatistics:');
    console.log(` Total quotes: ${quotes.length}`);
    console.log(` With tags:    ${tagStats.quotesWithTags}`);
    console.log(` Without tags: ${tagStats.quotesWithoutTags}`);
    console.log(` Unique tags:  ${uniqueCount}`);
    console.log(` Tag links:    ${tagStats.totalAssignments}`);
    const sorted = [...tagStats.tagCounts.entries()].sort((a,b) => b[1]-a[1]);
    console.log('\nTop 5 tags:');
    sorted.slice(0,5).forEach(([tag,c], i) =>
      console.log(`  ${i+1}. ${tag} (${c})`)
    );
  }

} catch (err) {
  console.error('\nInitialisation failed:', err.message);
  process.exit(1);
} finally {
  db.close();
>>>>>>> e7c96cae556c2a726309e1290d699576ec3e5656
}
