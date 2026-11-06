import type { Metadata, Viewport } from 'next'
import { Open_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})

const antiqueLegacy = localFont({
  variable: '--font-antique-legacy',
  display: 'swap',
  src: [
    { path: '../public/fonts/antique-legacy/Antique-Legacy-Light.woff2', weight: '300', style: 'normal' },
    { path: '../public/fonts/antique-legacy/Antique-Legacy-Light-Italic.woff2', weight: '300', style: 'italic' },
    { path: '../public/fonts/antique-legacy/Antique-Legacy-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/antique-legacy/Antique-Legacy-Italic.woff2', weight: '400', style: 'italic' },
    { path: '../public/fonts/antique-legacy/Antique-Legacy-Book.woff2', weight: '450', style: 'normal' },
    { path: '../public/fonts/antique-legacy/Antique-Legacy-Book-Italic.woff2', weight: '450', style: 'italic' },
    { path: '../public/fonts/antique-legacy/Antique-Legacy-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/antique-legacy/Antique-Legacy-Medium-Italic.woff2', weight: '500', style: 'italic' },
  ],
})

export const metadata: Metadata = {
  title: 'Requests | Privacy Rights Automation (Bulk actions prototype)',
  description: 'Interactive prototype for DSAR bulk action improvements, built on the Vitreus design system.',
  icons: { icon: '/icon.svg' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f7f7f7',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`bg-background ${openSans.variable} ${antiqueLegacy.variable}`}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  )
}
