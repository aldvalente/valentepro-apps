import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ValentePro App - Modern E-Commerce',
  description: 'Modern e-commerce application built with Next.js, TypeScript, and Prisma',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
