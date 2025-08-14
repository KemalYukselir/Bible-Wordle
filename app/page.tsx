"use client"

import { useState } from "react"
import { ArrowRight, BookOpen, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
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

// Bible verses data
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
    verseNumber: "16",
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
    verseNumber: "13",
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
    verseNumber: "1",
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
    verseNumber: "5",
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
    verseNumber: "9",
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
  const [selectedVerse, setSelectedVerse] = useState<(typeof sampleVerses)[0] | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
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

  // Filter verses based on search term
  const filteredVerses = sampleVerses.filter(
    (verse) =>
      verse.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verse.reference.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleVerseSelect = (verse: (typeof sampleVerses)[0]) => {
    setSelectedVerse(verse)
    setDropdownOpen(false)
    setSearchTerm("")
  }

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

    // Animate the reveal of categories
    const currentGuessIndex = updatedGuesses.length - 1
    const categories = ["book", "speaker", "randomWord", "location", "chapterRange", "verseNumber"] as const

    categories.forEach((category, index) => {
      setTimeout(
        () => {
          setGuesses((prev) =>
            prev.map((guess, guessIndex) =>
              guessIndex === currentGuessIndex
                ? { ...guess, revealedCategories: { ...guess.revealedCategories, [category]: true } }
                : guess,
            ),
          )
        },
        (index + 1) * 300,
      )
    })

    // Check if won and finish revealing
    setTimeout(
      () => {
        const won = Object.values(newFeedback).every(Boolean)
        if (won) {
          setHasWon(true)
          setGameOver(true)
        }
        setIsRevealing(false)
      },
      categories.length * 300 + 200,
    )

    // Reset selection for next guess
    setSelectedVerse(null)
  }

  const resetGame = () => {
    setSelectedVerse(null)
    setGuesses([])
    setGameOver(false)
    setHasWon(false)
    setIsRevealing(false)
    setDropdownOpen(false)
    setSearchTerm("")
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
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* README Button */}
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
                <section>
                  <h3 className="text-yellow-400 font-bold text-lg mb-3">🎮 How to Play</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-2">Step 1: Select a Verse</h4>
                      <p className="text-gray-300">
                        Click the dropdown to see all available verses. You can search by typing part of the verse text
                        or reference.
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-2">Step 2: Submit Your Guess</h4>
                      <p className="text-gray-300">
                        Click the yellow arrow button to submit your guess and see the results.
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-2">Step 3: Review Results</h4>
                      <p className="text-gray-300">Watch as each category reveals with color coding:</p>
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
                  </div>
                </section>

                <Separator className="bg-gray-700" />

                <section>
                  <h3 className="text-yellow-400 font-bold text-lg mb-3">📊 Game Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">📖 Book</h4>
                      <p className="text-gray-300 text-xs">Which book of the Bible</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">🗣️ Speaker</h4>
                      <p className="text-gray-300 text-xs">Who said or wrote the verse</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">🔑 Key Word</h4>
                      <p className="text-gray-300 text-xs">Important word from the verse</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">📍 Location</h4>
                      <p className="text-gray-300 text-xs">Where it was spoken/written</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">📑 Chapter Range</h4>
                      <p className="text-gray-300 text-xs">Chapter range in the book</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">🔢 Verse Number</h4>
                      <p className="text-gray-300 text-xs">The verse number</p>
                    </div>
                  </div>
                </section>

                <Separator className="bg-gray-700" />

                <section>
                  <h3 className="text-yellow-400 font-bold text-lg mb-3">📜 Available Verses</h3>
                  <div className="space-y-2">
                    {sampleVerses.map((verse) => (
                      <div key={verse.id} className="bg-gray-800/50 rounded-lg p-2">
                        <span className="text-cyan-400 font-semibold">{verse.reference}</span>
                        <span className="text-gray-300"> - "{verse.text}"</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Logo */}
        <div className="mb-12 text-center">
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
          <p
            className="text-xl sm:text-2xl font-bold tracking-wide"
            style={{
              color: "#FDE047",
              textShadow: "0 0 15px rgba(253, 224, 71, 0.6), 0 2px 4px rgba(0,0,0,0.8)",
              filter: "drop-shadow(0 0 10px rgba(253, 224, 71, 0.4))",
            }}
          >
            Guess the verse Challenge
          </p>
        </div>

        {/* Game Panel */}
        <div className="w-full max-w-md">
          <div className="bg-gray-800/80 backdrop-blur-sm border-2 border-yellow-500/50 rounded-xl p-8 mb-6">
            <h2 className="text-white text-xl font-semibold text-center mb-2">Guess today's Bible verse!</h2>
            <p className="text-gray-400 text-center mb-6">Select a verse to make your guess.</p>

            {/* Custom Dropdown */}
            <div className="relative mb-4">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={gameOver || isRevealing}
                className="w-full bg-gray-900/90 border-2 border-cyan-400 rounded-lg px-6 py-4 text-left text-gray-400 focus:outline-none focus:border-cyan-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed pr-20 hover:bg-gray-800/90 focus:bg-gray-800/90 shadow-lg hover:shadow-cyan-400/20 focus:shadow-cyan-400/30 flex items-center justify-between"
                style={{
                  boxShadow: "0 0 20px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                }}
              >
                <div className="flex-1">
                  {selectedVerse ? (
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-cyan-300 text-sm">"{selectedVerse.text}"</span>
                      <span className="text-xs text-gray-500">
                        {selectedVerse.reference} ({selectedVerse.version})
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-base">Select a verse...</span>
                  )}
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-cyan-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!selectedVerse || gameOver || isRevealing}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full transition-all duration-200 disabled:cursor-not-allowed z-10"
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

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-cyan-400/50 rounded-lg shadow-xl z-50 max-h-64 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-700">
                    <input
                      type="text"
                      placeholder="Search verses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Verse List */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredVerses.length > 0 ? (
                      filteredVerses.map((verse) => (
                        <button
                          key={verse.id}
                          onClick={() => handleVerseSelect(verse)}
                          className="w-full text-left p-3 hover:bg-gray-700/70 transition-colors border-b border-gray-700/50 last:border-b-0"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-cyan-300 text-sm">"{verse.text}"</span>
                            <span className="text-xs text-gray-400">
                              {verse.reference} ({verse.version})
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">No verses found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="text-center mb-6">
            <p className="text-white text-sm">
              <span className="text-yellow-400 font-semibold">129</span> people already found out!
            </p>
          </div>

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

        {/* Results */}
        {guesses.length > 0 && (
          <div className="w-full max-w-4xl mt-8">
            <div className="space-y-6">
              {guesses.map((guess, index) => (
                <div key={index} className="space-y-3">
                  <div className="text-sm font-medium text-white text-center">
                    Guess {index + 1}: "{guess.verse.text}" - {guess.verse.reference}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                    {[
                      { key: "book", label: "Book", value: guess.verse.book },
                      { key: "speaker", label: "Speaker", value: guess.verse.speaker },
                      { key: "randomWord", label: "Key Word", value: guess.verse.randomWord },
                      { key: "location", label: "Location", value: guess.verse.location },
                      { key: "chapterRange", label: "Chapter Range", value: guess.verse.chapterRange },
                      { key: "verseNumber", label: "Verse Number", value: guess.verse.verseNumber },
                    ].map(({ key, label, value }) => (
                      <div key={key} className="text-center">
                        <h3 className="font-semibold text-white mb-2 text-xs sm:text-sm">{label}</h3>
                        <div
                          className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 transform ${
                            guess.revealedCategories[key as keyof typeof guess.revealedCategories]
                              ? guess.feedback[key as keyof typeof guess.feedback]
                                ? "bg-green-500 border-green-600 text-white scale-105"
                                : "bg-red-500 border-red-600 text-white scale-105"
                              : "bg-gray-600 border-gray-500 text-gray-400 scale-95"
                          }`}
                        >
                          <div className="font-bold text-xs sm:text-sm">
                            {guess.revealedCategories[key as keyof typeof guess.revealedCategories] ? value : "?"}
                          </div>
                        </div>
                      </div>
                    ))}
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
