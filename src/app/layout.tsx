import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Jer Satyp Aluu Quest',
  description: 'Million Som Land Blueprint - The Game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ky">
      <body>{children}</body>
    </html>
  )
}
