# load_verses.py
from google.cloud import firestore
import os
import json

# STEP 1: Set your Google credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "service_account.json"

# STEP 2: Connect to Firestore
db = firestore.Client()

# STEP 3: Fetch verses from Firestore
def load_verses():
    verses_ref = db.collection("verses")
    docs = verses_ref.stream()

    verses = []
    for doc in docs:
        verse_data = doc.to_dict()
        verse_data["id"] = doc.id  # include document ID
        verses.append(verse_data)

    return verses

# STEP 4: Save to JSON file
def save_verses_to_json(verses, filename="loaded_verses.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(verses, f, ensure_ascii=False, indent=2)

# STEP 5: Run script
if __name__ == "__main__":
    verses = load_verses()
    save_verses_to_json(verses)
    print(f"✅ Saved {len(verses)} verses to 'verses.json'")
