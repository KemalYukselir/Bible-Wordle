# VERSELE - Bible Verse Guessing Game

A modern, interactive Bible verse guessing game inspired by Wordle and LoLdle. Test your knowledge of Scripture by identifying the correct Bible verse based on various clues and categories.

![Versele Game Screenshot](https://via.placeholder.com/800x400/1f2937/fde047?text=VERSELE+Game)

## 🎮 How to Play

1. **Search and Select**: Use the search dropdown to find and select a Bible verse from the available options
2. **Submit Your Guess**: Click the arrow button to submit your guess
3. **Review Feedback**: Watch as each category is revealed with color-coded results:
   - 🟢 **Green**: Correct match
   - 🔴 **Red**: Incorrect match
   - ⚫ **Gray**: Not yet revealed
4. **Keep Guessing**: Continue making guesses until you find the correct verse!

## 📊 Game Categories

Each guess is evaluated across 6 different categories:

- **📖 Book**: Which book of the Bible (e.g., Matthew, John, Psalms)
- **🗣️ Speaker**: Who said or wrote the verse (e.g., Jesus, Paul, David)
- **🔑 Key Word**: An important word from the verse
- **📍 Location**: Where the verse was spoken or written
- **📑 Chapter Range**: Approximate chapter range within the book
- **🔢 Verse Range**: The verse number range

## ✨ Features

- **🎯 Interactive Gameplay**: Engaging guessing mechanics with animated reveals
- **📱 Mobile Responsive**: Fully optimized for mobile, tablet, and desktop
- **🎨 Modern UI**: Beautiful gaming-inspired interface with smooth animations
- **💡 Help System**: Built-in instructions and game rules
- **📈 Progress Tracking**: Track your guesses and see your performance
- **🔍 Smart Search**: Easy-to-use verse search and selection
- **⚡ Real-time Feedback**: Instant visual feedback on your guesses

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: CSS transitions and transforms

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/versele.git
   cd versele
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to start playing!

## 📁 Project Structure

\`\`\`
versele/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── loading.tsx          # Loading component
│   └── page.tsx             # Main game component
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── theme-provider.tsx   # Theme provider
├── hooks/                   # Custom React hooks
├── lib/
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
└── README.md              # This file
\`\`\`

## 🎯 Game Modes & Features (Coming Soon)

- **📅 Daily Challenge**: New verse every day
- **🏆 Difficulty Levels**: Easy, Medium, Hard modes
- **📚 Category Filters**: Old Testament, New Testament, Psalms, etc.
- **⏱️ Speed Mode**: Time-based challenges
- **👥 Multiplayer**: Compete with friends
- **📊 Statistics**: Detailed performance analytics
- **🎖️ Achievements**: Unlock badges and rewards

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Areas for Contribution

- 📝 Adding more Bible verses to the database
- 🎨 UI/UX improvements
- 🐛 Bug fixes and optimizations
- 📱 Mobile experience enhancements
- 🌐 Internationalization support
- ♿ Accessibility improvements

## 📜 Bible Verses Database

The game currently includes sample verses from various books of the Bible:

- Matthew 5:14 - "You are the light of the world"
- John 3:16 - "For God so loved the world"
- Philippians 4:13 - "I can do all things through Christ"
- Psalm 23:1 - "The Lord is my shepherd"
- Proverbs 3:5 - "Trust in the Lord with all your heart"
- Joshua 1:9 - "Be strong and courageous"

*More verses will be added in future updates!*

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory for any environment-specific configurations:

\`\`\`env
# Add any environment variables here
NEXT_PUBLIC_APP_NAME=Versele
\`\`\`

### Customization

- **Colors**: Modify the color scheme in `tailwind.config.ts`
- **Fonts**: Update font families in `app/layout.tsx`
- **Verses**: Add new verses to the `sampleVerses` array in `app/page.tsx`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html) and [LoLdle](https://loldle.net/)
- Bible verses from the English Standard Version (ESV)
- Built with love for the Christian community
- Special thanks to all contributors and testers

## 🔧 Support

If you encounter any issues or have questions:

- 🐛 **Bug Reports**: [Open an issue](https://github.com/yourusername/versele/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/yourusername/versele/discussions)
- 📧 **Contact**: your.email@example.com

---

**Made with ❤️ and ✝️ for the body of Christ**

*"Your word is a lamp to my feet and a light to my path." - Psalm 119:105*
