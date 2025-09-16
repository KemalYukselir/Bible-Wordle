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

def get_playerbase_guess_count():
    """Return the number of players who guessed today"""
    db = get_db()
    today = datetime.date.today().isoformat()

    # Reference to playerbase guess count 
    vod_ref = db.collection("playerbase").document("guessCount")
    vod_doc = vod_ref.get()

    if vod_doc.exists and vod_doc.to_dict().get("date") == today:
        count = vod_doc.to_dict()["count"]
        return count
    else:
        count = random.randint(5, 15)  # Random padding for beta
        vod_ref.set({"date": today, "count": count})
        return count

def set_playerbase_guess_count():
    """Set the number of players who guessed today"""
    db = get_db()
    today = datetime.date.today().isoformat()

    # Reference to playerbase guess count
    vod_ref = db.collection("playerbase").document("guessCount")
    vod_doc = vod_ref.get()

    current_count = vod_doc.to_dict()["count"]
    current_count += 1

    vod_ref.set({"date": today, "count": current_count})



if __name__ == "__main__":
    set_playerbase_guess_count()