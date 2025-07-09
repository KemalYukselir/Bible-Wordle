"use client"

import { useState } from "react"
import { Search, Book } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Expanded Bible verses data
const sampleVerses = [
  {
    id: 1,
    text: "You are the light of the world",
    reference: "Matthew 5:14",
    version: "ESV",
    book: "Matthew",
    speaker: "Jesus",
    randomWord: "light",
  },
  {
    id: 2,
    text: "For God so loved the world",
    reference: "John 3:16",
    version: "ESV",
    book: "John",
    speaker: "Jesus",
    randomWord: "loved",
  },
  {
    id: 3,
    text: "I can do all things through Christ",
    reference: "Philippians 4:13",
    version: "ESV",
    book: "Philippians",
    speaker: "Paul",
    randomWord: "things",
  },
  {
    id: 4,
    text: "The Lord is my shepherd",
    reference: "Psalm 23:1",
    version: "ESV",
    book: "Psalms",
    speaker: "David",
    randomWord: "shepherd",
  },
  {
    id: 5,
    text: "Trust in the Lord with all your heart",
    reference: "Proverbs 3:5",
    version: "ESV",
    book: "Proverbs",
    speaker: "Solomon",
    randomWord: "trust",
  },
  {
    id: 6,
    text: "Be strong and courageous",
    reference: "Joshua 1:9",
    version: "ESV",
    book: "Joshua",
    speaker: "God",
    randomWord: "courageous",
  },
  {
    id: 7,
    text: "Love your neighbor as yourself",
    reference: "Matthew 22:39",
    version: "ESV",
    book: "Matthew",
    speaker: "Jesus",
    randomWord: "neighbor",
  },
  {
    id: 8,
    text: "Be still and know that I am God",
    reference: "Psalm 46:10",
    version: "ESV",
    book: "Psalms",
    speaker: "God",
    randomWord: "still",
  },
  {
    id: 9,
    text: "Fear not, for I am with you",
    reference: "Isaiah 41:10",
    version: "ESV",
    book: "Isaiah",
    speaker: "God",
    randomWord: "fear",
  },
  {
    id: 10,
    text: "Rejoice in the Lord always",
    reference: "Philippians 4:4",
    version: "ESV",
    book: "Philippians",
    speaker: "Paul",
    randomWord: "rejoice",
  },
  {
    id: 11,
    text: "Cast all your anxiety on him",
    reference: "1 Peter 5:7",
    version: "ESV",
    book: "1 Peter",
    speaker: "Peter",
    randomWord: "anxiety",
  },
  {
    id: 12,
    text: "Seek first the kingdom of God",
    reference: "Matthew 6:33",
    version: "ESV",
    book: "Matthew",
    speaker: "Jesus",
    randomWord: "kingdom",
  },
  {
    id: 13,
    text: "Come to me, all who are weary",
    reference: "Matthew 11:28",
    version: "ESV",
    book: "Matthew",
    speaker: "Jesus",
    randomWord: "weary",
  },
  {
    id: 14,
    text: "The joy of the Lord is your strength",
    reference: "Nehemiah 8:10",
    version: "ESV",
    book: "Nehemiah",
    speaker: "Nehemiah",
    randomWord: "joy",
  },
  {
    id: 15,
    text: "Walk by faith, not by sight",
    reference: "2 Corinthians 5:7",
    version: "ESV",
    book: "2 Corinthians",
    speaker: "Paul",
    randomWord: "faith",
  },
  {
    id: 16,
    text: "God works all things for good",
    reference: "Romans 8:28",
    version: "ESV",
    book: "Romans",
    speaker: "Paul",
    randomWord: "good",
  },
  {
    id: 17,
    text: "I am the way, the truth, and the life",
    reference: "John 14:6",
    version: "ESV",
    book: "John",
    speaker: "Jesus",
    randomWord: "way",
  },
  {
    id: 18,
    text: "Be transformed by the renewal of your mind",
    reference: "Romans 12:2",
    version: "ESV",
    book: "Romans",
    speaker: "Paul",
    randomWord: "transformed",
  },
  {
    id: 19,
    text: "The Lord your God is with you wherever you go",
    reference: "Joshua 1:9",
    version: "ESV",
    book: "Joshua",
    speaker: "God",
    randomWord: "wherever",
  },
  {
    id: 20,
    text: "Love is patient, love is kind",
    reference: "1 Corinthians 13:4",
    version: "ESV",
    book: "1 Corinthians",
    speaker: "Paul",
    randomWord: "patient",
  },
]

// Correct answer for the game (this would normally come from your game logic)
const correctAnswer = {
  book: "Matthew",
  speaker: "Jesus",
  randomWord: "light",
}

export default function GuessTheVerse() {
  const [open, setOpen] = useState(false)
  const [selectedVerse, setSelectedVerse] = useState<(typeof sampleVerses)[0] | null>(null)
  const [guesses, setGuesses] = useState<
    Array<{
      verse: (typeof sampleVerses)[0]
      feedback: { book: boolean; speaker: boolean; randomWord: boolean }
      revealedCategories: { book: boolean; speaker: boolean; randomWord: boolean }
    }>
  >([])
  const [gameOver, setGameOver] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const maxGuesses = 6 // Like Wordle

  const handleSubmit = () => {
    if (!selectedVerse || gameOver || isRevealing) return

    const newFeedback = {
      book: selectedVerse.book === correctAnswer.book,
      speaker: selectedVerse.speaker === correctAnswer.speaker,
      randomWord: selectedVerse.randomWord === correctAnswer.randomWord,
    }

    const newGuess = {
      verse: selectedVerse,
      feedback: newFeedback,
      revealedCategories: { book: false, speaker: false, randomWord: false },
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

      // Check if won (all categories correct)
      const won = Object.values(newFeedback).every(Boolean)
      if (won) {
        setHasWon(true)
        setGameOver(true)
      } else if (updatedGuesses.length >= maxGuesses) {
        // Game over - max guesses reached
        setGameOver(true)
      }

      setIsRevealing(false)
    }, 900)

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Guess the Verse</h1>
          <p className="text-gray-600">Can you identify the correct Bible verse?</p>
        </div>

        {/* Game Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              Select Your Guess
            </CardTitle>
            <CardDescription>Search and select the Bible verse you think matches the clues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Verse Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Bible Verse</label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto min-h-[2.5rem] text-left bg-transparent"
                    disabled={gameOver || isRevealing}
                  >
                    {selectedVerse ? (
                      <div className="flex flex-col items-start">
                        <span className="font-medium">"{selectedVerse.text}"</span>
                        <span className="text-sm text-gray-500">
                          {selectedVerse.reference} ({selectedVerse.version})
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Search for a Bible verse...</span>
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search verses..." />
                    <CommandList>
                      <CommandEmpty>No verse found.</CommandEmpty>
                      <CommandGroup>
                        {sampleVerses.map((verse) => (
                          <CommandItem
                            key={verse.id}
                            value={`${verse.text} ${verse.reference}`}
                            onSelect={() => {
                              setSelectedVerse(verse)
                              setOpen(false)
                            }}
                            className="flex flex-col items-start p-3"
                          >
                            <span className="font-medium">"{verse.text}"</span>
                            <span className="text-sm text-gray-500">
                              {verse.reference} ({verse.version})
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={!selectedVerse || gameOver || isRevealing} className="flex-1">
                {isRevealing ? "Revealing..." : gameOver ? (hasWon ? "You Won!" : "Game Over") : "Submit Guess"}
              </Button>
              {gameOver && (
                <Button onClick={resetGame} variant="outline">
                  Play Again
                </Button>
              )}
            </div>

            {/* Guess Counter */}
            {guesses.length > 0 && (
              <div className="text-center text-sm text-gray-600">
                Guess {guesses.length} of {maxGuesses}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Card - Show all guesses */}
        {guesses.length > 0 && (
          <Card className="shadow-lg border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Your Guesses</CardTitle>
              <CardDescription>
                {gameOver
                  ? hasWon
                    ? "Congratulations! You found the correct verse!"
                    : `Game over! The correct answer was: ${correctAnswer.book} - ${correctAnswer.speaker} - ${correctAnswer.randomWord}`
                  : "Keep guessing to find the correct verse"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {guesses.map((guess, index) => (
                  <div key={index} className="space-y-3">
                    <div className="text-sm font-medium text-gray-700">
                      Guess {index + 1}: "{guess.verse.text}" - {guess.verse.reference}
                    </div>

                    {/* Category Headers and Boxes */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Book</h3>
                        <div
                          className={`p-4 rounded-lg border-2 transition-all duration-500 transform ${
                            guess.revealedCategories.book
                              ? guess.feedback.book
                                ? "bg-green-500 border-green-600 text-white scale-105"
                                : "bg-red-500 border-red-600 text-white scale-105"
                              : "bg-gray-300 border-gray-400 text-gray-600 scale-95"
                          }`}
                        >
                          <div className="font-bold text-sm">
                            {guess.revealedCategories.book ? guess.verse.book : "?"}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Speaker</h3>
                        <div
                          className={`p-4 rounded-lg border-2 transition-all duration-500 transform ${
                            guess.revealedCategories.speaker
                              ? guess.feedback.speaker
                                ? "bg-green-500 border-green-600 text-white scale-105"
                                : "bg-red-500 border-red-600 text-white scale-105"
                              : "bg-gray-300 border-gray-400 text-gray-600 scale-95"
                          }`}
                        >
                          <div className="font-bold text-sm">
                            {guess.revealedCategories.speaker ? guess.verse.speaker : "?"}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Key Word</h3>
                        <div
                          className={`p-4 rounded-lg border-2 transition-all duration-500 transform ${
                            guess.revealedCategories.randomWord
                              ? guess.feedback.randomWord
                                ? "bg-green-500 border-green-600 text-white scale-105"
                                : "bg-red-500 border-red-600 text-white scale-105"
                              : "bg-gray-300 border-gray-400 text-gray-600 scale-95"
                          }`}
                        >
                          <div className="font-bold text-sm">
                            {guess.revealedCategories.randomWord ? guess.verse.randomWord : "?"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {index < guesses.length - 1 && <hr className="border-gray-200" />}
                  </div>
                ))}

                {/* Overall Progress */}
                {gameOver && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <h3 className="font-semibold text-blue-900 mb-2">Final Result</h3>
                      <div className="text-2xl font-bold text-blue-800">
                        {hasWon
                          ? `Solved in ${guesses.length}/${maxGuesses} guesses!`
                          : `${guesses.length}/${maxGuesses} guesses used`}
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
