const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;
const cors = require('cors');

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
});

app.get('/categories/:lang?', (req, res) => {
    const lang = req.params.lang || 'en';
    const categories = [...new Set(quotes.map(q => (q[lang] || q['en']).category))];
    res.json(categories);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});