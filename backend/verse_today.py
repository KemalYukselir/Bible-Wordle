# backend/verse_today.py
import os, json, random, datetime
from pathlib import Path
from dotenv import load_dotenv
from google.cloud import firestore
from google.oauth2 import service_account

# Load environment variables
ENV_PATH = Path(__file__).with_name(".env")
load_dotenv(dotenv_path=ENV_PATH)

def get_db():
    """Connect to Firestore using service account details from .env"""
    project_id = os.getenv("FIREBASE_PROJECT_ID")
    if not project_id:
        raise RuntimeError("FIREBASE_PROJECT_ID not set")

    # Load credentials (file or JSON)
    sa_file = os.getenv("FIREBASE_CREDENTIALS_FILE")
    if sa_file:
        p = Path(sa_file)
        if not p.is_absolute():
            p = Path(__file__).parent / p
        creds = service_account.Credentials.from_service_account_file(str(p))
    else:
        sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
        if not sa_json:
            raise RuntimeError("No Firebase credentials provided")
        creds = service_account.Credentials.from_service_account_info(json.loads(sa_json))

    return firestore.Client(project=project_id, credentials=creds)

def get_verse():
    """Return today's verse, choosing randomly if not already set"""
    db = get_db()
    today = datetime.date.today().isoformat()

    # Reference to verse-of-the-day document
    vod_ref = db.collection("config").document("verseOfTheDay")
    vod_doc = vod_ref.get()

    # If verse already picked today → return it
    if vod_doc.exists and vod_doc.to_dict().get("date") == today:
        verse_id = vod_doc.to_dict()["verseId"]
        verse = db.collection("verses").document(verse_id).get().to_dict()
        return {"id": verse_id, **verse}

    # Otherwise → pick random verse
    verses = list(db.collection("verses").stream())
    if not verses:
        raise RuntimeError("No verses in database")

    choice = random.choice(verses)
    verse_id, verse_data = choice.id, choice.to_dict()

    # Save to config so all users see same verse today
    vod_ref.set({"date": today, "verseId": verse_id})

    return {"id": verse_id, **verse_data}

if __name__ == "__main__":
    verse = get_verse()
    print("Verse of the Day:", verse)
