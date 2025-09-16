import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Versele - Bible Verse Guessing Game",
  description: "A Wordle-inspired Bible verse guessing game. Test your knowledge of Scripture!",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-indigo-900">
      <head>
        <meta name="google-site-verification" content="EFDt331zQAgwXUcuCaJj0Lo1SqSNz80guE1CktCMPz4" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
