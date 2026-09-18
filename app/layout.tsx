import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'XCreator CRM — Subscriber Intelligence for X Creators',
  description: 'Track churn, automate win-backs, and grow your paid subscriber revenue on X.',
  openGraph: {
    title: 'XCreator CRM',
    description: 'The CRM built for X creators with paid subscribers.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
