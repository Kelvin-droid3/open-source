from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import random 
import threading
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer
import os   
import re
import random
from transformers import AutoModelForCausalLM, AutoTokenizer

app = Flask(__name__)
CORS(app)

# Load local quotes
quotes_path = os.path.join(os.path.dirname(__file__), 'quotes.json')
try:
    # Try UTF-8 first
    with open(quotes_path, 'r', encoding='utf-8') as f:
        quotes = json.load(f)
except UnicodeDecodeError:
    try:
        # Fallback to binary read
        with open(quotes_path, 'rb') as f:
            content = f.read().decode('utf-8')
            quotes = json.loads(content)
    except Exception as e:
        print(f"Error loading quotes: {e}")
        quotes = []

# Local AI model setup
model = None
tokenizer = None

def load_model():
    global model, tokenizer
    try:
        model = AutoModelForCausalLM.from_pretrained(
            "EleutherAI/gpt-neo-125M",
            cache_dir="./models"
        )
        tokenizer = AutoTokenizer.from_pretrained(
            "EleutherAI/gpt-neo-125M",
            cache_dir="./models"
        )
        print("AI model loaded locally")
    except Exception as e:
        print(f"Error loading AI model: {e}")

# Load model in background
threading.Thread(target=load_model, daemon=True).start()

def generate_local_ai_quote(prompt, category="inspirational"):
    # Ensure model and tokenizer are properly initialized
    if not model or not tokenizer:
        raise RuntimeError("AI model not initialized")

    # Configure tokenizer with essential settings
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Enhanced prompt engineering
    structured_prompt = f"""Generate a {category} quote in English.
    Requirements:
    - 5-15 words
    - Complete sentence
    - No repetition
    - Category-appropriate
    - No quotation marks
    
    {prompt}
    """
    
    try:
        # Tokenize with proper settings
        inputs = tokenizer(
            structured_prompt,
            return_tensors="pt",
            max_length=256,
            truncation=True,
            padding="max_length",
            return_attention_mask=True
        )

        # Generate with carefully tuned parameters
        outputs = model.generate(
            input_ids=inputs.input_ids,
            attention_mask=inputs.attention_mask,
            max_new_tokens=80,
            temperature=0.8,
            top_p=0.9,
            top_k=40,
            repetition_penalty=1.5,
            no_repeat_ngram_size=3,
            do_sample=True,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
            early_stopping=True
        )

        # Decode and clean output
        full_output = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract generated content after prompt
        if structured_prompt in full_output:
            clean_output = full_output.split(structured_prompt)[-1].strip()
        else:
            clean_output = full_output.strip()

        # Remove any remaining artifacts
        clean_output = re.sub(r'[^a-zA-Z0-9\s.,!?\'"-]', '', clean_output)
        clean_output = ' '.join(clean_output.split())  # Normalize whitespace

        # Final validation
        if len(clean_output.split()) < 3:  # If output is too short
            raise ValueError("Output too short")

        return clean_output

    except Exception as e:
        print(f"AI generation failed: {str(e)}")
        # Comprehensive fallback system
        category_fallbacks = {
            "funny": [
                "Why don't scientists trust atoms? Because they make up everything!",
                "I'm reading a book about anti-gravity - it's impossible to put down!",
                "Parallel lines have so much in common... it's a shame they'll never meet"
            ],
            "inspirational": [
                "The only way to do great work is to love what you do",
                "Believe you can and you're halfway there",
                "Every accomplishment starts with the decision to try"
            ],
            "motivational": [
                "Don't watch the clock; do what it does. Keep going.",
                "The secret of getting ahead is getting started",
                "You are never too old to set another goal"
            ]
        }
        
        # Get category-specific fallbacks or default to inspirational
        fallbacks = category_fallbacks.get(category.lower(), category_fallbacks["inspirational"])
        return random.choice(fallbacks)
        
@app.route('/random/<lang>')
def random_quote(lang='en'):
    try:
        # Check if AI generation is requested
        if request.args.get('ai') == 'true' and model:
            category = request.args.get('category', 'inspirational')
            prompt = f"Generate a short {category} quote in {lang} (under 10 words):"
            ai_text = generate_local_ai_quote(prompt, category)
            return jsonify({
                "text": {"en": ai_text.replace(prompt, "").strip(' "\'')},
                "author": "AI Generated",
                "category": category,
                "image": ""
            })
        
        # Return a random quote from the JSON file
        quote = random.choice(quotes)
        response = {
            "text": quote["text"].get(lang, quote["text"]["en"]),  # Fallback to English
            "author": quote["author"],
            "category": quote["category"],
            "image": quote.get("image", ""),
        }
        if "Title" in quote:
            response["title"] = quote["Title"]
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in /random endpoint: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/categories')
def get_categories():
    try:
        categories = set()
        for q in quotes:
            categories.add(q["category"].lower())
        return jsonify({"categories": sorted(list(categories))})
    except Exception as e:
        print(f"Error in /categories endpoint: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000, debug=True)


    