# VERSELE — Bible Verse Guessing Game

## Live on -> https://versele.org/

A Wordle-inspired Bible verse guessing game built with **Next.js (frontend)** and **FastAPI (backend)**.  
The frontend handles the game logic and UI, while the backend serves a daily Bible verse from Firestore.

---

## ✨ Features

- **Interactive Gameplay**: Select from a curated list of Bible verses and guess the correct one.
- **Category-based Feedback**: Get feedback on 6 categories:
  - 📖 Book (which book of the Bible)  
  - 🗣️ Speaker (who said or wrote the verse)  
  - 🔑 Key Word (important word from the verse)  
  - 📍 Location (where it was spoken/written)  
  - 📑 Chapter Range (chapter range in the book)  
  - 🔢 Verse Number (the verse number)  
- **Animated Reveals**: Each category reveals with smooth animations.
- **Search Functionality**: Search through verses by text or reference.
- **Responsive Design**: Works on desktop and mobile devices.
- **Beautiful UI**: Gradient backgrounds and modern design.
- **Daily Verse Logic**: Backend provides a single verse per day, ensuring all players guess the same verse.

---

## 🎮 How to Play

1. **Select a Verse**: Click the dropdown to see all available verses (searchable).  
2. **Submit Your Guess**: Click the **GUESS** button to lock in your guess.  
3. **Review Results**: Categories reveal with colors:  
   - 🟢 **Green**: Correct match  
   - 🔴 **Red**: Incorrect match  
   - ⚫ **Gray**: Not yet revealed  

Your progress is saved in `localStorage` and resets with a new verse each day.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** 18+  
- **Python** 3.11+  
- npm or yarn

---
### 🔹 Frontend Setup (Next.js)

1. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

2. **Create `.env.local`**
   \`\`\`env
   NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open** http://localhost:3000


### 🔹 Backend Setup (FastAPI)

1. **Navigate to backend**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Create a virtual environment**
   \`\`\`bash
   python -m venv .venv
   source .venv/bin/activate
   \`\`\`

3. **Install dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Add Firestore service account credentials**
   - Save `service_account.json` inside `backend/` (gitignored), **or** configure via `.env`.

5. **Run the backend**
   \`\`\`bash
   uvicorn main:app --reload --port 8000
   \`\`\`

6. **Test endpoint**
   - http://127.0.0.1:8000/today


### 🌐 Deployment

**Backend (FastAPI)**
- Deployed on Render at  
  👉 https://bible-wordle.onrender.com
- Command:  
  `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Service account JSON is uploaded as a **Render Secret File**.

**Frontend (Next.js)**
- Deployed on Netlify  
- Environment variable:
  \`\`\`env
  \`\`\`
- Both deploy automatically from the **main** branch.

### 📂 Project Structure
\`\`\`bash
versele/
├── app/                    # Next.js App Router
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/             # React components
├── data/loaded_verses.json # Static verse dataset
├── public/                 # Static assets
│
└── backend/                # FastAPI backend
    ├── main.py             # API entry point
    ├── verse_today.py      # Verse of the day logic (Firestore)
    ├── requirements.txt    # Python dependencies
    └── service_account.json (gitignored)
\`\`\`

### 📜 Example Verses (from JSON)
- **Matthew 5:14** — "You are the light of the world"
- **John 3:16** — "For God so loved the world"
- **Philippians 4:13** — "I can do all things through Christ"
- **Psalm 23:1** — "The Lord is my shepherd"
- **Proverbs 3:5** — "Trust in the Lord with all your heart"
- **Joshua 1:9** — "Be strong and courageous"

### 🛠️ Tech Stack
**Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui, Lucide React  
**Backend:** FastAPI, Firestore (Google Cloud), Pydantic, Uvicorn  
**Hosting:** Frontend—Netlify, Backend—Render

### 📜 License
This project is licensed under the MIT License — see `LICENSE`.
