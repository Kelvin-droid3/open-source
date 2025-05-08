import json
import os
from bs4 import BeautifulSoup
import requests

BASE_URL = 'https://quotes.toscrape.com'
DB_PATH = os.path.join('db', 'quotes.json')

def load_existing_quotes():
    """Load existing quotes from JSON file or return empty list"""
    if os.path.exists(DB_PATH):
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

def is_duplicate(new_quote, existing_quotes):
    """Check if quote text exists regardless of author"""
    return any(
        q['quote'].lower() == new_quote['quote'].lower()
        for q in existing_quotes
    )

def scrape_quotes_toscrape(existing_quotes):
    """Scrape quotes.toscrape.com and return new unique quotes"""
    new_quotes = []
    page = 1
    
    while True:
        url = f'{BASE_URL}/page/{page}/'
        response = requests.get(url)
        
        if response.status_code != 200:
            break
            
        soup = BeautifulSoup(response.text, 'html.parser')
        quotes = soup.find_all('div', class_='quote')
        
        for quote in quotes:
            text = quote.find('span', class_='text').text.strip('“”')
            author = quote.find('small', class_='author').text.strip()
            tags = [tag.text.strip() for tag in quote.find_all('a', class_='tag')]
            
            new_quote = {
                "quote": text,
                "author": author,
                "tags": tags
            }
            
            if not is_duplicate(new_quote, existing_quotes + new_quotes):
                new_quotes.append(new_quote)
        
        # Check for next page
        if not soup.select_one('li.next > a'):
            break
            
        page += 1
    
    return new_quotes

# Main execution
os.makedirs('db', exist_ok=True)
existing_quotes = load_existing_quotes()
new_quotes = scrape_quotes_toscrape(existing_quotes)

if new_quotes:
    # Save combined quotes
    all_quotes = existing_quotes + new_quotes
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(all_quotes, f, ensure_ascii=False, indent=2)
        
    print(f"Added {len(new_quotes)} new quotations (Total: {len(all_quotes)})")
else:
    print("No new quotations found. Total quotations remain:", len(existing_quotes))
