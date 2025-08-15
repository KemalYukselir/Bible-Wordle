# backend/seed.py
import os, json, re
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


def doc_id_for(v: dict) -> str:
    if "id" in v and v["id"] is not None:
        return str(v["id"])
    ref = str(v.get("reference", "unknown"))
    return re.sub(r"[^a-z0-9]+", "-", ref.lower()).strip("-") or "unknown"

def chunk(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i+n]

def main():
    db = make_db()
    data_path = Path(__file__).parent / "verses.json"
    verses = json.loads(data_path.read_text(encoding="utf-8"))
    if not isinstance(verses, list):
        raise RuntimeError("verses.json must contain a JSON array")

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
