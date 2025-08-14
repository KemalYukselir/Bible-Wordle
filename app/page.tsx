"use client"

import { useState } from "react"
import { ArrowRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

// Expanded Bible verses data with Location
const sampleVerses = [
  {
    id: 1,
    text: "You are the light of the world",
    reference: "Matthew 5:14",
    version: "ESV",
    book: "Matthew",
    speaker: "Jesus",
    randomWord: "light",
    location: "Galilee",
    chapterRange: "1-10",
    verseNumber: "14",
  },
  {
    id: 2,
    text: "For God so loved the world",
    reference: "John 3:16",
    version: "ESV",
    book: "John",
    speaker: "Jesus",
    randomWord: "loved",
    location: "Jerusalem",
    chapterRange: "1-5",
    verseNumber: "10",
  },
  {
    id: 3,
    text: "I can do all things through Christ",
    reference: "Philippians 4:13",
    version: "ESV",
    book: "Philippians",
    speaker: "Paul",
    randomWord: "things",
    location: "Prison",
    chapterRange: "1-5",
    verseNumber: "16",
  },
  {
    id: 4,
    text: "The Lord is my shepherd",
    reference: "Psalm 23:1",
    version: "ESV",
    book: "Psalms",
    speaker: "David",
    randomWord: "shepherd",
    location: "Wilderness",
    chapterRange: "21-30",
    verseNumber: "16",
  },
  {
    id: 5,
    text: "Trust in the Lord with all your heart",
    reference: "Proverbs 3:5",
    version: "ESV",
    book: "Proverbs",
    speaker: "Solomon",
    randomWord: "trust",
    location: "Jerusalem",
    chapterRange: "1-5",
    verseNumber: "16",
  },
  {
    id: 6,
    text: "Be strong and courageous",
    reference: "Joshua 1:9",
    version: "ESV",
    book: "Joshua",
    speaker: "God",
    randomWord: "courageous",
    location: "Jordan River",
    chapterRange: "1-5",
    verseNumber: "16",
  },
]

// Correct answer for the game
const correctAnswer = {
  book: "Matthew",
  speaker: "Jesus",
  randomWord: "light",
  location: "Galilee",
  chapterRange: "1-10",
  verseNumber: "14",
}

export default function GuessTheVerse() {
  const [open, setOpen] = useState(false)
  const [selectedVerse, setSelectedVerse] = useState<(typeof sampleVerses)[0] | null>(null)
  const [guesses, setGuesses] = useState<
    Array<{
      verse: (typeof sampleVerses)[0]
      feedback: {
        book: boolean
        speaker: boolean
        randomWord: boolean
        location: boolean
        chapterRange: boolean
        verseNumber: boolean
      }
      revealedCategories: {
        book: boolean
        speaker: boolean
        randomWord: boolean
        location: boolean
        chapterRange: boolean
        verseNumber: boolean
      }
    }>
  >([])
  const [gameOver, setGameOver] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)

  const handleSubmit = () => {
    if (!selectedVerse || gameOver || isRevealing) return

    const newFeedback = {
      book: selectedVerse.book === correctAnswer.book,
      speaker: selectedVerse.speaker === correctAnswer.speaker,
      randomWord: selectedVerse.randomWord === correctAnswer.randomWord,
      location: selectedVerse.location === correctAnswer.location,
      chapterRange: selectedVerse.chapterRange === correctAnswer.chapterRange,
      verseNumber: selectedVerse.verseNumber === correctAnswer.verseNumber,
    }

    const newGuess = {
      verse: selectedVerse,
      feedback: newFeedback,
      revealedCategories: {
        book: false,
        speaker: false,
        randomWord: false,
        location: false,
        chapterRange: false,
        verseNumber: false,
      },
    }

    const updatedGuesses = [...guesses, newGuess]
    setGuesses(updatedGuesses)
    setIsRevealing(true)

    // Animate the reveal of categories from left to right
    const currentGuessIndex = updatedGuesses.length - 1

    setTimeout(() => {
      setGuesses((prev) =>
        prev.map((guess, index) =>
          index === currentGuessIndex
            ? { ...guess, revealedCategories: { ...guess.revealedCategories, book: true } }
            : guess,
        ),
      )
    }, 300)

    setTimeout(() => {
      setGuesses((prev) =>
        prev.map((guess, index) =>
          index === currentGuessIndex
            ? { ...guess, revealedCategories: { ...guess.revealedCategories, speaker: true } }
            : guess,
        ),
      )
    }, 600)

    setTimeout(() => {
      setGuesses((prev) =>
        prev.map((guess, index) =>
          index === currentGuessIndex
            ? { ...guess, revealedCategories: { ...guess.revealedCategories, randomWord: true } }
            : guess,
        ),
      )
    }, 900)

    setTimeout(() => {
      setGuesses((prev) =>
        prev.map((guess, index) =>
          index === currentGuessIndex
            ? { ...guess, revealedCategories: { ...guess.revealedCategories, location: true } }
            : guess,
        ),
      )
    }, 1200)

    setTimeout(() => {
      setGuesses((prev) =>
        prev.map((guess, index) =>
          index === currentGuessIndex
            ? { ...guess, revealedCategories: { ...guess.revealedCategories, chapterRange: true } }
            : guess,
        ),
      )
    }, 1500)

    setTimeout(() => {
      setGuesses((prev) =>
        prev.map((guess, index) =>
          index === currentGuessIndex
            ? { ...guess, revealedCategories: { ...guess.revealedCategories, verseNumber: true } }
            : guess,
        ),
      )

      const won = Object.values(newFeedback).every(Boolean)
      if (won) {
        setHasWon(true)
        setGameOver(true)
      }

      setIsRevealing(false)
    }, 1800)

    // Reset selection for next guess
    setSelectedVerse(null)
    setOpen(false)
  }

  const resetGame = () => {
    setSelectedVerse(null)
    setGuesses([])
    setGameOver(false)
    setHasWon(false)
    setIsRevealing(false)
    setOpen(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/background.avif"
          alt="Background"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center"
          style={{
            imageRendering: "crisp-edges",
          }}
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* README Button - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg px-3 py-2 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">README</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900/95 border-yellow-500/30 text-white max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-yellow-400 text-2xl font-bold">VERSELE - Documentation</DialogTitle>
              <DialogDescription className="text-gray-300">
                Complete guide to playing the Bible verse guessing game
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6 text-sm">
                {/* Game Overview */}
                <section>
                  <h3 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">🎮 Game Overview</h3>
                  <p className="text-gray-300 leading-relaxed">
                    VERSELE is a modern, interactive Bible verse guessing game inspired by Wordle and LoLdle. Test your
                    knowledge of Scripture by identifying the correct Bible verse based on various clues and categories.
                    Each day features a new verse to discover!
                  </p>
                </section>

                <Separator className="bg-gray-700" />

                {/* How to Play */}
                <section>
                  <h3 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">📖 How to Play</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-2">Step 1: Search & Select</h4>
                      <p className="text-gray-300">
                        Use the search dropdown to find and select a Bible verse from the available options. Type any
                        part of the verse text or reference to filter results.
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-2">Step 2: Submit Your Guess</h4>
                      <p className="text-gray-300">
                        Click the yellow arrow button to submit your guess and see how close you are to the correct
                        answer.
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-2">Step 3: Review Feedback</h4>
                      <p className="text-gray-300">
                        Watch as each category is revealed with animated color-coded results:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
                        <li>
                          🟢 <strong className="text-green-400">Green</strong>: Correct match
                        </li>
                        <li>
                          🔴 <strong className="text-red-400">Red</strong>: Incorrect match
                        </li>
                        <li>
                          ⚫ <strong className="text-gray-400">Gray</strong>: Not yet revealed
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-2">Step 4: Keep Guessing</h4>
                      <p className="text-gray-300">
                        Continue making guesses until you find the correct verse. Use the feedback from previous guesses
                        to narrow down your options!
                      </p>
                    </div>
                  </div>
                </section>

                <Separator className="bg-gray-700" />

                {/* Game Categories */}
                <section>
                  <h3 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">📊 Game Categories</h3>
                  <p className="text-gray-300 mb-4">Each guess is evaluated across 6 different categories:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">📖 Book</h4>
                      <p className="text-gray-300 text-xs">Which book of the Bible (e.g., Matthew, John, Psalms)</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">🗣️ Speaker</h4>
                      <p className="text-gray-300 text-xs">Who said or wrote the verse (e.g., Jesus, Paul, David)</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">🔑 Key Word</h4>
                      <p className="text-gray-300 text-xs">An important word from the verse</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">📍 Location</h4>
                      <p className="text-gray-300 text-xs">Where the verse was spoken or written</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">📑 Chapter Range</h4>
                      <p className="text-gray-300 text-xs">Approximate chapter range within the book</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">🔢 Verse Range</h4>
                      <p className="text-gray-300 text-xs">The verse number range</p>
                    </div>
                  </div>
                </section>

                <Separator className="bg-gray-700" />

                {/* Current Features */}
                <section>
                  <h3 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">
                    ✨ Current Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm">Interactive gameplay with animated reveals</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm">Mobile responsive design</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm">Modern gaming-inspired UI</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm">Built-in help system</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm">Progress tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm">Smart verse search</span>
                    </div>
                  </div>
                </section>

                <Separator className="bg-gray-700" />

                {/* Bible Verses Database */}
                <section>
                  <h3 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">
                    📜 Bible Verses Database
                  </h3>
                  <p className="text-gray-300 mb-3">
                    The game currently includes carefully selected verses from various books of the Bible:
                  </p>
                  <div className="space-y-2">
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <span className="text-cyan-400 font-semibold">Matthew 5:14</span>
                      <span className="text-gray-300"> - "You are the light of the world"</span>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <span className="text-cyan-400 font-semibold">John 3:16</span>
                      <span className="text-gray-300"> - "For God so loved the world"</span>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <span className="text-cyan-400 font-semibold">Philippians 4:13</span>
                      <span className="text-gray-300"> - "I can do all things through Christ"</span>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <span className="text-cyan-400 font-semibold">Psalm 23:1</span>
                      <span className="text-gray-300"> - "The Lord is my shepherd"</span>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <span className="text-cyan-400 font-semibold">Proverbs 3:5</span>
                      <span className="text-gray-300"> - "Trust in the Lord with all your heart"</span>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <span className="text-cyan-400 font-semibold">Joshua 1:9</span>
                      <span className="text-gray-300"> - "Be strong and courageous"</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-3 italic">
                    *More verses will be added in future updates to expand the challenge!*
                  </p>
                </section>

                <Separator className="bg-gray-700" />

                {/* Coming Soon */}
                <section>
                  <h3 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">🚀 Coming Soon</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-yellow-400">⏳</span>
                      <span className="text-sm">Daily challenge mode</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-yellow-400">⏳</span>
                      <span className="text-sm">Difficulty levels (Easy/Medium/Hard)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-yellow-400">⏳</span>
                      <span className="text-sm">Category filters (OT/NT/Psalms)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-yellow-400">⏳</span>
                      <span className="text-sm">Speed mode challenges</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-yellow-400">⏳</span>
                      <span className="text-sm">Multiplayer competitions</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-yellow-400">⏳</span>
                      <span className="text-sm">Detailed statistics & achievements</span>
                    </div>
                  </div>
                </section>

                <Separator className="bg-gray-700" />

                {/* Tech Stack */}
                <section>
                  <h3 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">🛠️ Tech Stack</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <div className="text-cyan-400 font-semibold">Next.js 15</div>
                      <div className="text-gray-400 text-xs">React Framework</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <div className="text-cyan-400 font-semibold">TypeScript</div>
                      <div className="text-gray-400 text-xs">Type Safety</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <div className="text-cyan-400 font-semibold">Tailwind CSS</div>
                      <div className="text-gray-400 text-xs">Styling</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <div className="text-cyan-400 font-semibold">shadcn/ui</div>
                      <div className="text-gray-400 text-xs">UI Components</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <div className="text-cyan-400 font-semibold">Lucide React</div>
                      <div className="text-gray-400 text-xs">Icons</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                      <div className="text-cyan-400 font-semibold">CSS Animations</div>
                      <div className="text-gray-400 text-xs">Smooth Transitions</div>
                    </div>
                  </div>
                </section>

                <Separator className="bg-gray-700" />

                {/* Tips & Strategies */}
                <section>
                  <h3 className="text-yellow-400 font-bold text-lg mb-3 flex items-center gap-2">
                    💡 Tips & Strategies
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                      <h4 className="text-blue-400 font-semibold mb-1">🎯 Start with Popular Verses</h4>
                      <p className="text-gray-300 text-sm">
                        Begin with well-known verses like John 3:16 or Psalm 23:1 to get familiar with the game
                        mechanics.
                      </p>
                    </div>
                    <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                      <h4 className="text-green-400 font-semibold mb-1">📖 Pay Attention to Speakers</h4>
                      <p className="text-gray-300 text-sm">
                        Jesus, Paul, and David are common speakers. Use this information to narrow down your guesses.
                      </p>
                    </div>
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3">
                      <h4 className="text-purple-400 font-semibold mb-1">🗺️ Consider Historical Context</h4>
                      <p className="text-gray-300 text-sm">
                        Location clues can help identify the setting - Jerusalem, Galilee, or Prison contexts give
                        valuable hints.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator className="bg-gray-700" />

                {/* Footer */}
                <section className="text-center">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-300 font-semibold mb-2">Made with ❤️ and ✝️ for the body of Christ</p>
                    <p className="text-gray-400 text-sm italic">
                      "Your word is a lamp to my feet and a light to my path." - Psalm 119:105
                    </p>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Simple New Versele Logo Design */}
        <div className="mb-12 text-center">
          {/* Main Logo Text */}
          <h1
            className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-wide mb-3"
            style={{
              background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 30%, #D97706 70%, #FCD34D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 0 20px rgba(252, 211, 77, 0.4)",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
              fontFamily: "Impact, 'Arial Black', sans-serif",
            }}
          >
            VERSELE
          </h1>

          {/* Bright Yellow Subtitle */}
          <p
            className="text-xl sm:text-2xl font-bold tracking-wide"
            style={{
              color: "#FDE047",
              textShadow: "0 0 15px rgba(253, 224, 71, 0.6), 0 2px 4px rgba(0,0,0,0.8)",
              filter: "drop-shadow(0 0 10px rgba(253, 224, 71, 0.4))",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            Guess the verse Challenge
          </p>
        </div>

        {/* Main Game Panel */}
        <div className="w-full max-w-md">
          <div className="bg-gray-800/80 backdrop-blur-sm border-2 border-yellow-500/50 rounded-xl p-8 mb-6">
            <h2 className="text-white text-xl font-semibold text-center mb-2">Guess today's Bible verse!</h2>
            <p className="text-gray-400 text-center mb-6">Type any verse reference to begin.</p>

            {/* Input Field */}
            <div className="relative">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="w-full bg-gray-900/90 border-2 border-cyan-400 rounded-lg px-6 py-4 text-left text-gray-400 focus:outline-none focus:border-cyan-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed pr-20 hover:bg-gray-800/90 focus:bg-gray-800/90 shadow-lg hover:shadow-cyan-400/20 focus:shadow-cyan-400/30"
                    style={{
                      boxShadow: "0 0 20px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    }}
                    disabled={gameOver || isRevealing}
                  >
                    {selectedVerse ? (
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-cyan-300 text-sm">"{selectedVerse.text}"</span>
                        <span className="text-xs text-gray-500">
                          {selectedVerse.reference} ({selectedVerse.version})
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-base">Type verse reference ...</span>
                    )}
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-full max-w-md p-0 bg-gray-800/95 backdrop-blur-sm border-cyan-400/50"
                  align="start"
                >
                  <Command className="bg-gray-800/95">
                    <CommandInput
                      placeholder="Search verses..."
                      className="bg-transparent border-none text-white placeholder-gray-400"
                    />
                    <CommandList className="bg-gray-800/95">
                      <CommandEmpty className="text-gray-400">No verse found.</CommandEmpty>
                      <CommandGroup>
                        {sampleVerses.map((verse) => (
                          <CommandItem
                            key={verse.id}
                            value={`${verse.text} ${verse.reference}`}
                            onSelect={() => {
                              setSelectedVerse(verse)
                              setOpen(false)
                            }}
                            className="flex flex-col items-start p-3 text-white hover:bg-gray-700/50"
                          >
                            <span className="font-medium text-cyan-300 text-sm">"{verse.text}"</span>
                            <span className="text-xs text-gray-400">
                              {verse.reference} ({verse.version})
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!selectedVerse || gameOver || isRevealing}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full transition-all duration-200 disabled:cursor-not-allowed"
                style={{
                  background:
                    !selectedVerse || gameOver || isRevealing
                      ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                      : "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                  boxShadow:
                    !selectedVerse || gameOver || isRevealing
                      ? "0 4px 15px rgba(0, 0, 0, 0.3)"
                      : "0 0 25px rgba(251, 191, 36, 0.4), 0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  border: "2px solid #fbbf24",
                }}
              >
                <ArrowRight
                  className="w-6 h-6 text-yellow-400 drop-shadow-sm mx-auto"
                  style={{
                    filter: "drop-shadow(0 1px 2px rgba(251, 191, 36, 0.3))",
                  }}
                />
              </button>
            </div>
          </div>

          {/* Stats Text */}
          <div className="text-center mb-6">
            <p className="text-white text-sm">
              <span className="text-yellow-400 font-semibold">129</span> people already found out!
            </p>
          </div>

          {/* Yesterday's Answer */}
          <div className="text-center mb-8">
            <p className="text-white">
              Yesterday's verse was <span className="text-green-400 font-semibold">#23 John 3:16</span>
            </p>
          </div>

          {/* Game Over Actions */}
          {gameOver && (
            <div className="text-center mb-8">
              <div className="space-y-4">
                <p className="text-yellow-400 font-semibold text-lg">
                  {hasWon ? "Congratulations! You found the correct verse!" : "Game Over!"}
                </p>
                <Button
                  onClick={resetGame}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-3"
                >
                  Play Again
                </Button>
              </div>
            </div>
          )}

          {/* Revealing Status */}
          {isRevealing && (
            <div className="text-center mb-8">
              <p className="text-cyan-400">Revealing results...</p>
            </div>
          )}
        </div>

        {/* Feedback Results */}
        {guesses.length > 0 && (
          <div className="w-full max-w-4xl mt-8">
            <div className="space-y-6">
              {guesses.map((guess, index) => (
                <div key={index} className="space-y-3">
                  <div className="text-sm font-medium text-white text-center">
                    Guess {index + 1}: "{guess.verse.text}" - {guess.verse.reference}
                  </div>

                  {/* Category Headers and Boxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                    <div className="text-center">
                      <h3 className="font-semibold text-white mb-2 text-xs sm:text-sm">Book</h3>
                      <div
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 transform ${
                          guess.revealedCategories.book
                            ? guess.feedback.book
                              ? "bg-green-500 border-green-600 text-white scale-105"
                              : "bg-red-500 border-red-600 text-white scale-105"
                            : "bg-gray-600 border-gray-500 text-gray-400 scale-95"
                        }`}
                      >
                        <div className="font-bold text-xs sm:text-sm">
                          {guess.revealedCategories.book ? guess.verse.book : "?"}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="font-semibold text-white mb-2 text-xs sm:text-sm">Speaker</h3>
                      <div
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 transform ${
                          guess.revealedCategories.speaker
                            ? guess.feedback.speaker
                              ? "bg-green-500 border-green-600 text-white scale-105"
                              : "bg-red-500 border-red-600 text-white scale-105"
                            : "bg-gray-600 border-gray-500 text-gray-400 scale-95"
                        }`}
                      >
                        <div className="font-bold text-xs sm:text-sm">
                          {guess.revealedCategories.speaker ? guess.verse.speaker : "?"}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="font-semibold text-white mb-2 text-xs sm:text-sm">Key Word</h3>
                      <div
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 transform ${
                          guess.revealedCategories.randomWord
                            ? guess.feedback.randomWord
                              ? "bg-green-500 border-green-600 text-white scale-105"
                              : "bg-red-500 border-red-600 text-white scale-105"
                            : "bg-gray-600 border-gray-500 text-gray-400 scale-95"
                        }`}
                      >
                        <div className="font-bold text-xs sm:text-sm">
                          {guess.revealedCategories.randomWord ? guess.verse.randomWord : "?"}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="font-semibold text-white mb-2 text-xs sm:text-sm">Location</h3>
                      <div
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 transform ${
                          guess.revealedCategories.location
                            ? guess.feedback.location
                              ? "bg-green-500 border-green-600 text-white scale-105"
                              : "bg-red-500 border-red-600 text-white scale-105"
                            : "bg-gray-600 border-gray-500 text-gray-400 scale-95"
                        }`}
                      >
                        <div className="font-bold text-xs sm:text-sm">
                          {guess.revealedCategories.location ? guess.verse.location : "?"}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="font-semibold text-white mb-2 text-xs sm:text-sm">Chapter Range</h3>
                      <div
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 transform ${
                          guess.revealedCategories.chapterRange
                            ? guess.feedback.chapterRange
                              ? "bg-green-500 border-green-600 text-white scale-105"
                              : "bg-red-500 border-red-600 text-white scale-105"
                            : "bg-gray-600 border-gray-500 text-gray-400 scale-95"
                        }`}
                      >
                        <div className="font-bold text-xs sm:text-sm">
                          {guess.revealedCategories.chapterRange ? guess.verse.chapterRange : "?"}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="font-semibold text-white mb-2 text-xs sm:text-sm">Verse Range</h3>
                      <div
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 transform ${
                          guess.revealedCategories.verseNumber
                            ? guess.feedback.verseNumber
                              ? "bg-green-500 border-green-600 text-white scale-105"
                              : "bg-red-500 border-red-600 text-white scale-105"
                            : "bg-gray-600 border-gray-500 text-gray-400 scale-95"
                        }`}
                      >
                        <div className="font-bold text-xs sm:text-sm">
                          {guess.revealedCategories.verseNumber ? guess.verse.verseNumber : "?"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {index < guesses.length - 1 && <hr className="border-gray-600" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
