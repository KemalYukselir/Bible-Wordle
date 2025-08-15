# Versele - Bible Verse Guessing Game

A Wordle-inspired Bible verse guessing game built with Next.js and React.

## Features

- **Interactive Gameplay**: Select from a curated list of Bible verses and guess the correct one
- **Category-based Feedback**: Get feedback on 6 different categories:
  - 📖 Book (which book of the Bible)
  - 🗣️ Speaker (who said or wrote the verse)
  - 🔑 Key Word (important word from the verse)
  - 📍 Location (where it was spoken/written)
  - 📑 Chapter Range (chapter range in the book)
  - 🔢 Verse Number (the verse number)
- **Animated Reveals**: Watch as each category reveals with smooth animations
- **Search Functionality**: Search through verses by text or reference
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful UI**: Gradient backgrounds and modern design

## How to Play

1. **Select a Verse**: Click the dropdown to see all available verses. You can search by typing part of the verse text or reference.
2. **Submit Your Guess**: Click the "GUESS" button to submit your guess and see the results.
3. **Review Results**: Watch as each category reveals with color coding:
   - 🟢 **Green**: Correct match
   - 🔴 **Red**: Incorrect match
   - ⚫ **Gray**: Not yet revealed

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/versele.git
cd versele
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Project Structure

\`\`\`
versele/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main game component
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── theme-provider.tsx
├── lib/                  # Utility functions
├── public/              # Static assets
└── backend/            # Python backend (optional)
\`\`\`

## Available Verses

The game currently includes these Bible verses:

1. **Matthew 5:14** - "You are the light of the world"
2. **John 3:16** - "For God so loved the world"
3. **Philippians 4:13** - "I can do all things through Christ"
4. **Psalm 23:1** - "The Lord is my shepherd"
5. **Proverbs 3:5** - "Trust in the Lord with all your heart"
6. **Joshua 1:9** - "Be strong and courageous"

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Wordle and other word-guessing games
- Bible verses from the ESV (English Standard Version)
- Built with modern web technologies
