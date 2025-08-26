# backend/seed.py
import os, json, re, csv
from pathlib import Path
from dotenv import load_dotenv
from google.cloud import firestore
from google.oauth2 import service_account

# Always load the .env that sits next to this file
ENV_PATH = Path(__file__).with_name(".env")
load_dotenv(dotenv_path=ENV_PATH)

def make_db():
    project_id = os.getenv("FIREBASE_PROJECT_ID")
    if not project_id:
        raise RuntimeError("FIREBASE_PROJECT_ID not set in backend/.env")

    # Prefer file
    sa_file = os.getenv("FIREBASE_CREDENTIALS_FILE")
    if sa_file:
        p = Path(sa_file)
        if not p.is_absolute():
            p = Path(__file__).parent / p
        if not p.exists():
            raise RuntimeError(f"Credential file not found at: {p}")
        creds = service_account.Credentials.from_service_account_file(str(p))
        return firestore.Client(project=project_id, credentials=creds)

    # Fallback: inline JSON (must be exact JSON, one line, double quotes, \n in private_key)
    sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if sa_json and sa_json.strip().startswith("{"):
        creds = service_account.Credentials.from_service_account_info(json.loads(sa_json))
        return firestore.Client(project=project_id, credentials=creds)

    raise RuntimeError("No Firebase credentials provided. Set FIREBASE_CREDENTIALS_FILE or FIREBASE_SERVICE_ACCOUNT.")

def doc_id_for(v: dict) -> str:
    if "id" in v and v["id"] is not None:
        return str(v["id"])
    ref = str(v.get("reference", "unknown"))
    return re.sub(r"[^a-z0-9]+", "-", ref.lower()).strip("-") or "unknown"

def chunk(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i+n]

def load_input(data_path: Path):
    """
    Loads verses from CSV (preferred) or JSON, returning a list[dict].
    CSV must have headers matching the JSON keys, e.g.:
    text,version,id,speaker,chapterRange,verseNumber,randomWord,location,book,reference
    """
    if data_path.suffix.lower() == ".csv":
        verses = []
        with data_path.open("r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Skip completely blank lines
                if not row or all((v is None or str(v).strip() == "") for v in row.values()):
                    continue
                # Trim whitespace from keys/values
                clean = { (k.strip() if k else k): (v.strip() if isinstance(v, str) else v) for k, v in row.items() }
                verses.append(clean)
        return verses
    elif data_path.suffix.lower() == ".json":
        data = json.loads(data_path.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            # If someone accidentally saved an object, wrap it
            data = [data]
        return data
    else:
        raise RuntimeError(f"Unsupported input format for {data_path}. Use .csv or .json")

def main():
    db = make_db()

    # You can override the path via VERSES_PATH=.csv or .json
    default_path = Path(__file__).parent / "verses.csv"  # <- CSV by default
    data_path = Path(os.getenv("VERSES_PATH", str(default_path)))

    verses = load_input(data_path)
    if not isinstance(verses, list):
        raise RuntimeError(f"{data_path.name} must contain an array of rows")

    expected_cols = {
        "text","version","id","speaker","chapterRange","verseNumber",
        "randomWord","location","book","reference"
    }
    missing = expected_cols - set(verses[0].keys() if verses else [])
    if missing:
        print(f"Warning: {data_path.name} is missing columns: {sorted(missing)}")
        # Not fatal — Firestore can still store what you provide.

    col = db.collection("verses")
    total = 0
    for group in chunk(verses, 450):  # Firestore batch limit ~500
        batch = db.batch()
        for v in group:
            batch.set(col.document(doc_id_for(v)), v, merge=True)
        batch.commit()
        total += len(group)
        print(f"Committed {total}…")

    print(f"Done. Wrote {total} docs to 'verses'.")

if __name__ == "__main__":
    main()
