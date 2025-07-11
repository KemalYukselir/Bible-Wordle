"use client"

import { useState } from "react"
import { ArrowRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    chapterRange: "1-10", // Sermon on the Mount
    verseNumber: "14", // Final chapter
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
    chapterRange: "1-5", // Nicodemus encounter
    verseNumber: "10", // Final chapter
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
    verseNumber: "16", // Final chapter
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
    chapterRange: "21-30", // Single psalm
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
    chapterRange: "1-5", // Wisdom chapter
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
    chapterRange: "1-5", // Leadership transition
    verseNumber: "16",
  },
]

// Correct answer for the game (this would normally come from your game logic)
const correctAnswer = {
  book: "Matthew",
  speaker: "Jesus",
  randomWord: "light",
  location: "Galilee",
  chapterRange: "1-10",
  verseNumber: "16",
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

      // Only end the game if they wåin - remove the else condition
      const won = Object.values(newFeedback).every(Boolean)
      if (won) {
        setHasWon(true)
        setGameOver(true)
      }
      // Remove the else block that was setting gameOver to true

      setIsRevealing(false)
    }, 1500)

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
      {/* High Quality Background Image using Next.js Image */}
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
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* README Button - Top Right */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800/80 border-yellow-500/50 text-yellow-400 hover:bg-gray-700/80 hover:text-yellow-300"
            >
              <Info className="w-4 h-4 mr-2" />
              README
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900/95 border-yellow-500/30 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-yellow-400 text-xl">Guess the Verse - Beta</DialogTitle>
              <DialogDescription className="text-gray-300">
                Welcome to the beta version of Guess the Verse!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-yellow-400 font-semibold mb-2">How to Play:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Search and select a Bible verse from the dropdown</li>
                  <li>Submit your guess to see how close you are</li>
                  <li>Green boxes mean correct matches, red boxes mean incorrect</li>
                  <li>Keep guessing until you find the right verse!</li>
                </ul>
              </div>

              <div>
                <h3 className="text-yellow-400 font-semibold mb-2">Categories:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>
                    <strong>Book:</strong> Which book of the Bible
                  </li>
                  <li>
                    <strong>Speaker:</strong> Who said or wrote the verse
                  </li>
                  <li>
                    <strong>Key Word:</strong> An important word from the verse
                  </li>
                  <li>
                    <strong>Location:</strong> Where the verse was spoken/written
                  </li>
                  <li>
                    <strong>Chapter Range:</strong> Approximate chapter range in the book
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-yellow-400 font-semibold mb-2">Beta Notes:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>This is a beta version with limited verses for testing</li>
                  <li>The game continues until you find the correct answer</li>
                  <li>More verses and features will be added in future updates</li>
                  <li>Feedback and suggestions are welcome!</li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-300 text-xs">
                  <strong>Current Answer:</strong> The correct verse is Matthew 5:14 - "You are the light of the world"
                  (Jesus speaking in Galilee, chapters 1-10 range)
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 py-4 sm:py-8 px-2 sm:px-4 mt-16 sm:mt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-400 drop-shadow-lg">
              Guess the Verse
            </h1>
          </div>

          {/* Game Panel - Exact LoLdle Style */}
          <div className="flex flex-col items-center">
            {/* Single Panel with dark background and yellow border */}
            <div className="w-full max-w-xs sm:max-w-md bg-[#1e2328] text-white/90 border-2 border-yellow-500 rounded-xl p-4 sm:p-6 flex items-center justify-center text-center text-sm sm:text-base">
              Can you identify the correct Bible verse?
            </div>

            {/* Input Panel - Now outside and below the dark box */}
            <div className="relative mt-4 w-full max-w-xs sm:max-w-sm">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="w-full bg-[#1e2328] border-2 border-cyan-400/50 px-4 py-3 text-left text-blue-400 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed pr-16"
                    disabled={gameOver || isRevealing}
                  >
                    {selectedVerse ? (
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-blue-300 text-sm">"{selectedVerse.text}"</span>
                        <span className="text-xs text-blue-500">
                          {selectedVerse.reference} ({selectedVerse.version})
                        </span>
                      </div>
                    ) : (
                      <span className="text-blue-500">Type verse reference or text...</span>
                    )}
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-full max-w-xs sm:max-w-2xl p-0 bg-gray-800/95 backdrop-blur-sm border-cyan-400/50"
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

              {/* Submit Button - Exact LoLdle Style */}
              <button
                onClick={handleSubmit}
                disabled={!selectedVerse || gameOver || isRevealing}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 border border-yellow-400 bg-white-500 hover:bg-white disabled:bg-white-600 disabled:cursor-not-allowed rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-yellow-400" />
              </button>
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center mt-4">
            {gameOver ? (
              <div className="space-y-4">
                <p className="text-yellow-400 font-semibold">
                  {hasWon ? "Congratulations! You found the correct verse!" : "Game Over!"}
                </p>
                <Button
                  onClick={resetGame}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2"
                >
                  Play Again
                </Button>
              </div>
            ) : isRevealing ? (
              <p className="text-cyan-400">Revealing results...</p>
            ) : null}
          </div>
        </div>

        {/* Feedback Card - Show all guesses backdrop-blur-sm */}
        {guesses.length > 0 && (
          <Card className="bg-transparent border-transparent max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white">
                <span className="text-green-500">129</span> Guesses Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {guesses.map((guess, index) => (
                  <div key={index} className="space-y-3">
                    <div className="text-sm font-medium text-white">
                      Guess {index + 1}: "{guess.verse.text}" - {guess.verse.reference}
                    </div>

                    {/* Category Headers and Boxes - Now 6 columns */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                      <div className="text-center">
                        <h3 className="font-semibold text-white mb-2 sm:mb-3 text-xs sm:text-sm">Book</h3>
                        <div
                          className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 border-1 border-white transform ${
                            guess.revealedCategories.book
                              ? guess.feedback.book
                                ? "bg-green-500 border-green-600 text-white scale-105"
                                : "bg-red-500 border-red-600 text-white scale-105"
                              : "bg-gray-300 border-gray-400 text-gray-600 scale-95"
                          }`}
                        >
                          <div className="font-bold text-xs sm:text-sm">
                            {guess.revealedCategories.book ? guess.verse.book : "?"}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <h3 className="font-semibold text-white mb-2 sm:mb-3 text-xs sm:text-sm">Speaker</h3>
                        <div
                          className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 border-1 border-white transform ${
                            guess.revealedCategories.speaker
                              ? guess.feedback.speaker
                                ? "bg-green-500 border-green-600 text-white scale-105"
                                : "bg-red-500 border-red-600 text-white scale-105"
                              : "bg-gray-300 border-gray-400 text-gray-600 scale-95"
                          }`}
                        >
                          <div className="font-bold text-xs sm:text-sm">
                            {guess.revealedCategories.speaker ? guess.verse.speaker : "?"}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <h3 className="font-semibold text-white mb-2 sm:mb-3 text-xs sm:text-sm">Key Word</h3>
                        <div
                          className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 border-1 border-white transform ${
                            guess.revealedCategories.randomWord
                              ? guess.feedback.randomWord
                                ? "bg-green-500 border-green-600 text-white scale-105"
                                : "bg-red-500 border-red-600 text-white scale-105"
                              : "bg-gray-300 border-gray-400 text-gray-600 scale-95"
                          }`}
                        >
                          <div className="font-bold text-xs sm:text-sm">
                            {guess.revealedCategories.randomWord ? guess.verse.randomWord : "?"}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <h3 className="font-semibold text-white mb-2 sm:mb-3 text-xs sm:text-sm">Location</h3>
                        <div
                          className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 border-1 border-white transform ${
                            guess.revealedCategories.location
                              ? guess.feedback.location
                                ? "bg-green-500 border-green-600 text-white scale-105"
                                : "bg-red-500 border-red-600 text-white scale-105"
                              : "bg-gray-300 border-gray-400 text-gray-600 scale-95"
                          }`}
                        >
                          <div className="font-bold text-xs sm:text-sm">
                            {guess.revealedCategories.location ? guess.verse.location : "?"}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <h3 className="font-semibold text-white mb-2 sm:mb-3 text-xs sm:text-sm">Chapter Range</h3>
                        <div
                          className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 border-1 border-white transform ${
                            guess.revealedCategories.chapterRange
                              ? guess.feedback.chapterRange
                                ? "bg-green-500 border-green-600 text-white scale-105"
                                : "bg-red-500 border-red-600 text-white scale-105"
                              : "bg-gray-300 border-gray-400 text-gray-600 scale-95"
                          }`}
                        >
                          <div className="font-bold text-xs sm:text-sm">
                            {guess.revealedCategories.chapterRange ? guess.verse.chapterRange : "?"}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <h3 className="font-semibold text-white mb-2 sm:mb-3 text-xs sm:text-sm">Verse Range</h3>
                        <div
                          className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-500 border-1 border-white transform ${
                            guess.revealedCategories.verseNumber
                              ? guess.feedback.verseNumber
                                ? "bg-green-500 border-green-600 text-white scale-105"
                                : "bg-red-500 border-red-600 text-white scale-105"
                              : "bg-gray-300 border-gray-400 text-gray-600 scale-95"
                          }`}
                        >
                          <div className="font-bold text-xs sm:text-sm">
                            {guess.revealedCategories.verseNumber ? guess.verse.verseNumber : "?"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {index < guesses.length - 1 && <hr className="border-gray-200" />}
                  </div>
                ))}

                {/* Overall Progress */}
                {gameOver && (
                  <div className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200">
                    <div className="text-center">
                      <h3 className="font-semibold text-blue-900 mb-2">Final Result</h3>
                      <div className="text-2xl font-bold text-blue-800">
                        {hasWon ? `Solved in ${guesses.length} guesses!` : `${guesses.length} guesses used`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
