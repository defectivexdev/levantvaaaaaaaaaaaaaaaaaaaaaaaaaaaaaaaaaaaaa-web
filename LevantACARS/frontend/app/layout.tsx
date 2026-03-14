import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Levant ACARS",
  description: "Flight tracking and PIREP submission for Levant Virtual Airlines",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
