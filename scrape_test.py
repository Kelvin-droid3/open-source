from bs4 import BeautifulSoup
import requests

base_url = 'https://quotes.toscrape.com'
all_tags = set()  # Using a set to avoid duplicates

def scrape_page(page_num):
    url = f'{base_url}/page/{page_num}/'
    response = requests.get(url)
    
    if response.status_code != 200:
        return False
    
    soup = BeautifulSoup(response.text, 'html.parser')
    quotes = soup.find_all('div', class_='quote')
    
    for quote in quotes:
        # Extract tags for current quote
        tags = quote.find('div', class_='tags').find_all('a', class_='tag')
        for tag in tags:
            all_tags.add(tag.text.strip())
    
    # Check for next page
    next_btn = soup.select_one('li.next > a')
    return next_btn is not None

# Scrape all pages (starts at page 1)
page = 1
while True:
    has_next_page = scrape_page(page)
    print(f'Scraped page {page}')
    if not has_next_page:
        break
    page += 1

# Print all unique tags sorted alphabetically
print('\nAll Unique Tags:')
for tag in sorted(all_tags):
    print(f'- {tag}')

print(f'\nTotal unique tags collected: {len(all_tags)}')
