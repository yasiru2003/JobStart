import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'JobStart — Sri Lanka\'s Premier Recruitment Platform',
    template: '%s | JobStart',
  },
  description:
    'JobStart connects employers, recruiters, and candidates across Sri Lanka. Post jobs, manage applications, and find your next opportunity.',
  keywords: ['jobs', 'recruitment', 'Sri Lanka', 'employment', 'careers', 'JobStart'],
  authors: [{ name: 'JobStart' }],
  openGraph: {
    title: 'JobStart',
    description: 'Sri Lanka\'s Premier Recruitment Platform',
    type: 'website',
    locale: 'en_LK',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  )
}
