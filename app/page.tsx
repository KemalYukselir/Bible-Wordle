"use client"

import type React from "react"

import { useLayoutEffect, useRef, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { BookOpen, ChevronDown, Share2, Youtube, Linkedin } from "lucide-react"
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

import versesFromJson from "@/data/loaded_verses.json" // ← your JSON file

const sampleVerses = versesFromJson

const API_BASE = process.env.NEXT_PUBLIC_API_BASE

// Drop down functionalities
export function VerseDropdown({
  open,
  anchorRef,
  children,
}: {
  open: boolean
  anchorRef: React.RefObject<HTMLElement>
  children: React.ReactNode
}) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  // helper to compute position from the anchor
  const compute = () => {
    if (!open || !anchorRef.current) return
    const r = anchorRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 8, left: r.left, width: r.width })
  }

  useLayoutEffect(() => {
    compute() // compute immediately on open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, anchorRef])

  useEffect(() => {
    if (!open) return

    let ticking = false
    const onScrollOrResize = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        compute()
        ticking = false
      })
    }

    // capture = true to catch scrolls from nested containers
    window.addEventListener("scroll", onScrollOrResize, true)
    window.addEventListener("resize", onScrollOrResize)

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true)
      window.removeEventListener("resize", onScrollOrResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, anchorRef])

  if (!open) return null

  return createPortal(
    <div
      style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width }}
      className="z-[9999] bg-gray-800/95 backdrop-blur-sm border border-cyan-400/50
                 rounded-lg shadow-xl ring-1 ring-white/10 max-h-64 overflow-hidden"
    >
      {children}
    </div>,
    document.body,
  )
}

const loadingTips = [
  "🙏 Tip: Start with shorter verses when guessing",
  "📖 Tip: Search by keywords in the verse text",
  "⛪ Tip: Think about the book's historical context",
  "🕊️ Tip: Recall the speaker to narrow down options",
  "🎯 Tip: Focus on unique chapter & verse numbers",
  "✨ Tip: Pay attention to repeated key words",
];

export default function GuessTheVerse() {
  // Server load
  useEffect(() => {
    let retryInterval: NodeJS.Timeout;
    let tipInterval: NodeJS.Timeout;

    // rotate tips every 3s
    tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 3000);

    const pingBackend = async () => {
      try {
        const res = await fetch(`${API_BASE}/today`, { cache: "no-store" });
        console.log("Pinging backend...", res.status);
        if (res.ok) {
          console.log("✅ Backend awake");
          setBooting(false);
          clearInterval(retryInterval);
          clearInterval(tipInterval);
        } else {
          throw new Error("Backend not ready");
        }
      } catch {
        console.warn("⚠️ Backend cold, retrying in 10s...");
      }
    };

    // first attempt immediately
    pingBackend();
    // retry every 10s until success
    retryInterval = setInterval(pingBackend, 10000);

    return () => {
      clearInterval(retryInterval);
      clearInterval(tipInterval);
    };
  }, []);

  // Correct answer for the game
  const [correctAnswer, setCorrectAnswer] = useState<(typeof sampleVerses)[0] | null>(null)
  const [loading, setLoading] = useState(true)

  const [booting, setBooting] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const [selectedVerse, setSelectedVerse] = useState<(typeof sampleVerses)[0] | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [guesses, setGuesses] = useState<
    Array<{
      verse: (typeof sampleVerses)[0]
      feedback: {
        book: boolean
        speaker: boolean
        Theme: boolean
        location: boolean
        chapterRange: boolean
        reference: boolean
      }
      revealedCategories: {
        book: boolean
        speaker: boolean
        Theme: boolean
        location: boolean
        chapterRange: boolean
        reference: boolean
      }
    }>
  >([])
  const [gameOver, setGameOver] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [visibleCategories, setVisibleCategories] = useState<{ [key: string]: boolean }>({})
  const guessesRef = useRef<HTMLDivElement>(null)

  // Load today's verse from the backend once
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

  // drop down functionality
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleSubmit = () => {
    if (!selectedVerse || gameOver) return

    const newFeedback = {
      book: selectedVerse.book === correctAnswer.book,
      speaker: selectedVerse.speaker === correctAnswer.speaker,
      Theme: selectedVerse.Theme === correctAnswer.Theme,
      location: selectedVerse.location === correctAnswer.location,
      chapterRange: selectedVerse.chapterRange === correctAnswer.chapterRange,
      reference: selectedVerse.reference === correctAnswer.reference,
    }

    const newGuess = {
      verse: selectedVerse,
      feedback: newFeedback,
      revealedCategories: {
        book: true,
        speaker: true,
        Theme: true,
        location: true,
        chapterRange: true,
        reference: true,
      },
    }

    const updatedGuesses = [...guesses, newGuess]
    setGuesses(updatedGuesses)

    setTimeout(() => {
      guessesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 100)

    setIsRevealing(true)
    setVisibleCategories({})

    const categories = ["book", "speaker", "Theme", "location", "chapterRange", "reference"]
    categories.forEach((category, index) => {
      setTimeout(() => {
        setVisibleCategories((prev) => ({ ...prev, [category]: true }))
        if (index === categories.length - 1) {
          setIsRevealing(false)
        }
      }, index * 300) // 300ms delay between each category
    })

    const won = Object.values(newFeedback).every(Boolean)
    if (won) {
      setTimeout(() => {
        setHasWon(true)
        setGameOver(true)
      }, categories.length * 300) // Wait for all animations to complete
    }

    // Reset selection for next guess
    setSelectedVerse(null)
  }

  const resetGame = async () => {
    setSelectedVerse(null)
    setGuesses([])
    setGameOver(false)
    setHasWon(false)
    setIsRevealing(false)
    setVisibleCategories({})
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

  const handleShare = () => {
    const shareText = `🎉 I found today's Bible verse in ${guesses.length} ${guesses.length === 1 ? "attempt" : "attempts"}!\n\n${correctAnswer?.reference} - "${correctAnswer?.text}"\n\nPlay VERSELE at ${window.location.origin}`

    if (navigator.share) {
      navigator.share({
        title: "VERSELE - Bible Verse Game",
        text: shareText,
        url: window.location.origin,
      })
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert("Results copied to clipboard!")
      })
    }
  }

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 animate-spin" />
          <h1 className="text-white text-2xl font-bold mb-4">Loading VERSELE</h1>
          <div className="bg-gray-800 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <p className="text-gray-400 text-sm mb-2">While you wait...</p>
            <p
              className="text-yellow-300 text-sm font-medium animate-fade-in"
              key={currentTipIndex}
            >
              {loadingTips[currentTipIndex]}
            </p>
          </div>
          <p className="text-gray-400 text-sm">Waking up the server</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `url('/background.png')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-indigo-900/60" />

      <div className="fixed top-4 left-4 z-20 flex gap-3">
        <div className="bg-gray-800/90 backdrop-blur-sm border-2 border-yellow-500 rounded-lg p-3 shadow-lg ring-1 ring-white/10">
          <h4 className="text-white font-semibold text-xs mb-2">Color Guide</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded border border-green-600"></div>
              <span className="text-white text-xs">Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded border border-red-600"></div>
              <span className="text-white text-xs">Incorrect</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-600">
            <span className="text-white font-medium text-xs">Version: ESV</span>
          </div>
        </div>
      </div>

      {/* README Button */}
      <div className="absolute top-4 right-4 z-20">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800 bg-white/70 hover:bg-white/90 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">Book</h4>
                      <p className="text-gray-300 text-xs">Which book of the Bible</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">Speaker</h4>
                      <p className="text-gray-300 text-xs">Who said or wrote the verse</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">Theme</h4>
                      <p className="text-gray-300 text-xs">Important word about the theme of the verse</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">Location</h4>
                      <p className="text-gray-300 text-xs">Where it was spoken/written</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">Chapter Range</h4>
                      <p className="text-gray-300 text-xs">Chapter range in the book</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-cyan-400 font-semibold mb-1">Verse Number</h4>
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
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 py-16">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4 gap-4">
            <div
              className="text-white text-4xl px-2 py-1 rounded-md"
              style={{
                textShadow: "4px 4px 8px rgba(0,0,0,1), 2px 2px 4px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.9)",
                WebkitTextStroke: "1px rgba(0,0,0,0.5)",
                backgroundColor: "rgba(0,0,0,0.1)",
              }}
            >
              ✝
            </div>
            <h1
              className="text-6xl sm:text-8xl font-bold text-white tracking-wider px-4 py-2 rounded-md"
              style={{
                fontFamily: "Impact, Arial Black, sans-serif",
                textShadow: "4px 4px 8px rgba(0,0,0,1), 2px 2px 4px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.9)",
                WebkitTextStroke: "1px rgba(0,0,0,0.5)",
                backgroundColor: "rgba(0,0,0,0.1)",
              }}
            >
              VERSELE
            </h1>
            <div
              className="text-white text-4xl px-2 py-1 rounded-md"
              style={{
                textShadow: "4px 4px 8px rgba(0,0,0,1), 2px 2px 4px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.9)",
                WebkitTextStroke: "1px rgba(0,0,0,0.5)",
                backgroundColor: "rgba(0,0,0,0.1)",
              }}
            >
              ✝
            </div>
          </div>
          <p
            className="text-lg sm:text-xl text-white font-medium px-3 py-1 rounded-md inline-block"
            style={{
              textShadow: "4px 4px 8px rgba(0,0,0,1), 2px 2px 4px rgba(0,0,0,0.8), 0 0 16px rgba(0,0,0,0.9)",
              WebkitTextStroke: "0.5px rgba(0,0,0,0.5)",
              backgroundColor: "rgba(0,0,0,0.1)",
            }}
          >
            Daily Bible Verse Challenge
          </p>
        </div>

        {/* Game Panel */}
        <div className="w-full max-w-xl mb-12">
          <div className="bg-gray-800/90 backdrop-blur-sm border-3 border-yellow-500 rounded-xl p-8 mb-6 shadow-lg ring-1 ring-white/10">
            <h2 className="text-white text-xl font-semibold text-center mb-2">Guess today's Bible verse!</h2>
            <p className="text-gray-300 text-center mb-2">Select a verse to make your guess.</p>
            <p className="text-yellow-400 text-center text-sm mb-6">1,247 people have guessed today</p>

            {/* Custom Dropdown */}
            <div className="relative mb-6">
              {/* Dropdown Menu */}
              <div className="relative mb-6">
                <button
                  ref={triggerRef}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  disabled={gameOver || isRevealing}
                  className="w-full bg-gray-900/90 border-2 border-cyan-400 rounded-lg px-6 py-5 text-left text-gray-400 focus:outline-none focus:border-cyan-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800/90 focus:bg-gray-800/90 shadow-lg hover:shadow-cyan-400/20 focus:shadow-cyan-400/30 flex items-center justify-between ring-1 ring-white/5"
                  style={{ boxShadow: "0 0 20px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)" }}
                >
                  {selectedVerse ? (
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-cyan-300 text-base">"{selectedVerse.text}"</span>
                      <span className="text-sm text-gray-500">
                        {selectedVerse.reference} ({selectedVerse.version})
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-lg">Select a verse...</span>
                  )}
                  <ChevronDown
                    className={`w-6 h-6 text-cyan-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* ⬇️ Portalized dropdown (replaces the old inline absolute div) */}
                <VerseDropdown open={dropdownOpen} anchorRef={triggerRef}>
                  {/* Search Input */}
                  <div className="p-4 border-b border-gray-700">
                    <input
                      type="text"
                      placeholder="Search verses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 text-base"
                    />
                  </div>

                  {/* Verse List */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredVerses.length > 0 ? (
                      filteredVerses.map((verse) => (
                        <button
                          key={verse.id}
                          onClick={() => handleVerseSelect(verse)}
                          className="w-full text-left p-4 hover:bg-gray-700/70 transition-colors border-b border-gray-700/50 last:border-b-0"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-cyan-300 text-base">"{verse.text}"</span>
                            <span className="text-sm text-gray-400">
                              {verse.reference} ({verse.version})
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">No verses found</div>
                    )}
                  </div>
                </VerseDropdown>
              </div>
            </div>

            {/* Guess Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!selectedVerse || gameOver}
                className="w-auto mx-auto py-2 px-6 rounded-lg font-black text-sm tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg border-2 ring-1 ring-white/10"
                style={{
                  background: "#374151",
                  borderColor: "#FDE047",
                  color: "#FDE047",
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
        </div>

        {/* Correct Answer Section */}
        {gameOver && hasWon && correctAnswer && (
          <div className="w-full max-w-4xl bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 mb-8 border-3 border-yellow-500 shadow-lg ring-1 ring-white/10">
            <div className="text-center">
              <h2 className="text-green-400 font-bold text-xl mb-6">
                🎉 You found it in {guesses.length} {guesses.length === 1 ? "attempt" : "attempts"}! 🎉
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {[
                  { key: "book", label: "Book", value: correctAnswer.book },
                  { key: "speaker", label: "Speaker", value: correctAnswer.speaker },
                  { key: "theme", label: "Theme", value: correctAnswer.Theme },
                  { key: "location", label: "Location", value: correctAnswer.location },
                  { key: "chapterRange", label: "Chapter Range", value: correctAnswer.chapterRange },
                ].map(({ key, label, value }) => (
                  <div key={key} className="text-center">
                    <h3 className="font-semibold text-white mb-2 text-xs sm:text-sm break-words hyphens-auto tracking-wide">
                      {label}
                    </h3>
                    <div className="p-3 sm:p-4 rounded-lg border-2 bg-green-500 border-green-600 text-white scale-95 transition-all duration-500 min-h-[3rem] min-w-[7rem] flex items-center justify-center ring-1 ring-white/20">
                      <div className="font-bold text-sm sm:text-base break-words hyphens-auto text-center leading-tight">
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-yellow-300 font-semibold text-lg">
                ✅ {correctAnswer.reference} — "{correctAnswer.text}" ✅
              </p>

              <div className="mt-6">
                <Button
                  onClick={handleShare}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto ring-1 ring-white/20"
                >
                  <Share2 className="w-4 h-4" />
                  Share Results
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Guess Results Section */}
        {guesses.length > 0 && (
          <div
            ref={guessesRef}
            className="w-full max-w-4xl bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border-3 border-yellow-500 mb-16 shadow-lg ring-1 ring-white/10"
          >
            <h3 className="text-white font-bold text-lg mb-6 text-center tracking-wide">📝 Your Guesses 📝</h3>
            <div className="space-y-8">
              {[...guesses].reverse().map((guess, reverseIndex) => {
                const index = guesses.length - 1 - reverseIndex
                const isLatestGuess = index === guesses.length - 1

                return (
                  <div key={index} className="space-y-3">
                    {isLatestGuess && (
                      <div className="flex justify-center mb-4">
                        <div className="bg-cyan-500/40 border border-cyan-400 rounded-full px-4 py-2 animate-pulse">
                          <span className="text-cyan-900 font-semibold text-sm tracking-wide">✨ Current Guess ✨</span>
                        </div>
                      </div>
                    )}

                    <div className="text-sm font-medium text-white text-center tracking-wide">
                      Guess {index + 1}: "{guess.verse.text}" - {guess.verse.reference}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                      {[
                        { key: "book", label: "Book", value: guess.verse.book },
                        { key: "speaker", label: "Speaker", value: guess.verse.speaker },
                        { key: "Theme", label: "Theme", value: guess.verse.Theme },
                        { key: "location", label: "Location", value: guess.verse.location },
                        { key: "chapterRange", label: "Chapter Range", value: guess.verse.chapterRange },
                      ].map(({ key, label, value }) => {
                        const shouldShow = !isLatestGuess || visibleCategories[key] || !isRevealing

                        return (
                          <div key={key} className="text-center">
                            <h3 className="font-semibold text-white mb-2 text-xs sm:text-sm break-words hyphens-auto tracking-wide">
                              {label}
                            </h3>
                            <div
                              className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 transform min-h-[2.5rem] flex items-center justify-center ring-1 ring-white/10 ${
                                shouldShow
                                  ? guess.feedback[key as keyof typeof guess.feedback]
                                    ? "bg-green-500 border-green-600 text-white scale-95 opacity-100"
                                    : "bg-red-500 border-red-600 text-white scale-95 opacity-100"
                                  : "bg-gray-600 border-gray-500 text-gray-400 scale-95 opacity-50"
                              }`}
                            >
                              <div className="font-bold text-xs sm:text-sm break-words hyphens-auto text-center leading-tight">
                                {shouldShow ? value : "..."}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {reverseIndex < guesses.length - 1 && <div className="border-gray-600"></div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Social Section */}
        <div className="flex gap-6 w-full max-w-2xl">
          <div className="flex-1 bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border-3 border-yellow-500 shadow-lg ring-1 ring-white/10">
            <div className="text-center">
              <h3 className="text-white font-bold text-lg mb-4 tracking-wide">🌐 Follow Us 🌐</h3>
              <div className="flex justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-3 ring-1 ring-white/10"
                  onClick={() => window.open("https://youtube.com", "_blank")}
                >
                  <Youtube className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-500 hover:bg-blue-600/10 p-3 ring-1 ring-white/10"
                  onClick={() => window.open("https://linkedin.com", "_blank")}
                >
                  <Linkedin className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border-3 border-yellow-500 shadow-lg ring-1 ring-white/10">
            <div className="text-center">
              <h3 className="text-white font-bold text-lg mb-4 tracking-wide">🎮 Check out other games 🎮</h3>
              <p className="text-gray-400 text-sm">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
