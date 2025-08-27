"use client"

import { useEffect, useState } from "react"
import { BookOpen, ChevronDown } from "lucide-react"
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

import versesFromJson from "@/data/loaded_verses.json" // ← your JSON file

const sampleVerses = versesFromJson

const API_BASE = process.env.NEXT_PUBLIC_API_BASE

export default function GuessTheVerse() {
  // Correct answer for the game
  const [correctAnswer, setCorrectAnswer] = useState<(typeof sampleVerses)[0] | null>(null)
  const [loading, setLoading] = useState(true)

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

  // ⬇️ load today's verse from the backend once
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/today`, { cache: "no-store" })
        const data = (await res.json()) as { id?: string } & Record<string, any>

        // prefer matching by id (most reliable)
        let match = data?.id ? sampleVerses.find((v) => v.id === data.id) : undefined

        // fallback: try by reference if your backend returns ref but not id
        if (!match && data?.ref) {
          match = sampleVerses.find((v) => v.reference?.toLowerCase() === String(data.ref).toLowerCase())
        }

        if (match) {
          setCorrectAnswer(match)
        } else {
          // ultimate fallback: keep UX working with first item
          setCorrectAnswer(sampleVerses[0])
          console.warn("Backend verse not found in local JSON; using fallback.")
        }
      } catch (e) {
        console.error("Failed to load verse of the day:", e)
        // fallback so the app still works
        setCorrectAnswer(sampleVerses[0])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // single daily key for everything
  const todayKey = new Date().toISOString().slice(0, 10)
  const stateKey = `versele:state:${todayKey}`

  // ✅ NEW: track hydration so we don't save too early (React Strict Mode)
  const [hydrated, setHydrated] = useState(false)

  // Load saved state on mount (runs before we allow saving)
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const saved = localStorage.getItem(stateKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        const { guesses, gameOver, hasWon } = parsed || {}
        if (Array.isArray(guesses)) setGuesses(guesses)
        if (typeof gameOver === "boolean") setGameOver(gameOver)
        if (typeof hasWon === "boolean") setHasWon(hasWon)
      }
    } catch (e) {
      console.warn("Failed to load saved state", e)
    } finally {
      setHydrated(true) // ✅ only now are we allowed to save
    }
  }, [stateKey])

  // Save whenever guesses/gameOver/hasWon change — BUT only after hydration
  useEffect(() => {
    if (!hydrated) return // ✅ guard fixes the clobbering in dev
    try {
      const saveData = { guesses, gameOver, hasWon }
      localStorage.setItem(stateKey, JSON.stringify(saveData))
    } catch (e) {
      console.warn("Failed to save state", e)
    }
  }, [hydrated, guesses, gameOver, hasWon, stateKey])

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

  const resetGame = async () => {
    setSelectedVerse(null)
    setGuesses([])
    setGameOver(false)
    setHasWon(false)
    setIsRevealing(false)
    setDropdownOpen(false)
    setSearchTerm("")
    // re-fetch (still same verse same day)
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/today`, { cache: "no-store" })
      const data = await res.json()
      const match =
        sampleVerses.find((v) => v.id === data.id) ||
        sampleVerses.find((v) => v.reference?.toLowerCase() === String(data.ref).toLowerCase())
      setCorrectAnswer(match || sampleVerses[0])
    } catch {
      setCorrectAnswer(sampleVerses[0])
    } finally {
      setLoading(false)
    }
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
                        Click the "GUESS" button to submit your guess and see the results.
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
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
        <div className="mb-16 text-center">
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
            <div className="relative mb-6">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={gameOver || isRevealing}
                className="w-full bg-gray-900/90 border-2 border-cyan-400 rounded-lg px-6 py-4 text-left text-gray-400 focus:outline-none focus:border-cyan-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800/90 focus:bg-gray-800/90 shadow-lg hover:shadow-cyan-400/20 focus:shadow-cyan-400/30 flex items-center justify-between"
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

            {/* Guess Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!selectedVerse || gameOver || isRevealing}
                className="w-auto mx-auto py-2 px-6 rounded-lg font-black text-sm tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg border-2"
                style={{
                  background: "#374151", // Gray background
                  borderColor: "#FDE047", // Yellow border
                  color: "#FDE047", // Yellow text
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                  boxShadow: "0 0 20px rgba(253, 224, 71, 0.3), 0 2px 8px rgba(0,0,0,0.2)",
                  filter: "brightness(1.1) drop-shadow(0 1px 4px rgba(253, 224, 71, 0.2))",
                  fontFamily: "Impact, 'Arial Black', sans-serif",
                }}
              >
                GUESS
              </button>
            </div>
          </div>

          {/* Game Over Actions */}
          {gameOver && hasWon && correctAnswer && (
            <div className="mt-8 text-center">
              <h2 className="text-green-400 font-bold text-xl mb-4">
                🎉 You found it in {guesses.length} {guesses.length === 1 ? "attempt" : "attempts"}!
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {[
                  { key: "book", label: "Book", value: correctAnswer.book },
                  { key: "speaker", label: "Speaker", value: correctAnswer.speaker },
                  { key: "randomWord", label: "Key Word", value: correctAnswer.randomWord },
                  { key: "location", label: "Location", value: correctAnswer.location },
                  { key: "chapterRange", label: "Chapter Range", value: correctAnswer.chapterRange },
                  { key: "verseNumber", label: "Verse Number", value: correctAnswer.verseNumber },
                ].map(({ key, label, value }) => (
                  <div key={key} className="text-center">
                    <h3 className="font-semibold text-white mb-2 text-xs sm:text-sm break-words hyphens-auto">
                      {label}
                    </h3>
                    <div className="p-4 sm:p-5 rounded-lg border-2 bg-green-500 border-green-600 text-white scale-105 transition-all duration-500 min-h-[3.5rem] min-w-[8rem] flex items-center justify-center">
                      <div className="font-bold text-sm sm:text-base break-words hyphens-auto text-center leading-tight">
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-yellow-300 font-semibold">
                ✅ {correctAnswer.reference} — "{correctAnswer.text}"
              </p>
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

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
                    {[
                      { key: "book", label: "Book", value: guess.verse.book },
                      { key: "speaker", label: "Speaker", value: guess.verse.speaker },
                      { key: "randomWord", label: "Key Word", value: guess.verse.randomWord },
                      { key: "location", label: "Location", value: guess.verse.location },
                      { key: "chapterRange", label: "Chapter Range", value: guess.verse.chapterRange },
                      { key: "verseNumber", label: "Verse Number", value: guess.verse.verseNumber },
                    ].map(({ key, label, value }) => (
                      <div key={key} className="text-center">
                        <h3 className="font-semibold text-white mb-2 text-xs sm:text-sm break-words hyphens-auto">
                          {label}
                        </h3>
                        <div
                          className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-500 transform min-h-[3rem] flex items-center justify-center ${
                            guess.revealedCategories[key as keyof typeof guess.revealedCategories]
                              ? guess.feedback[key as keyof typeof guess.feedback]
                                ? "bg-green-500 border-green-600 text-white scale-105"
                                : "bg-red-500 border-red-600 text-white scale-105"
                              : "bg-gray-600 border-gray-500 text-gray-400 scale-95"
                          }`}
                        >
                          <div className="font-bold text-xs sm:text-sm break-words hyphens-auto text-center leading-tight">
                            {guess.revealedCategories[key as keyof typeof guess.revealedCategories] ? value : "?"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {index < guesses.length - 1 && <div className="border-gray-600"></div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
