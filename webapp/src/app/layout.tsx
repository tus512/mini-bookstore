import type { Metadata } from 'next';
import { Playfair_Display, Outfit } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BOOKDOOR - Premium Bookstore Webapp',
  description: 'Step into a world of curated literature. Discover, browse, and purchase your next favorite read from our warm, elegant, premium library collection.',
  keywords: 'bookstore, books, reading, online book shop, library, novels, biography, travel, fiction',
  authors: [{ name: 'BOOKDOOR Team' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable}`}>
      <body className="bg-cream-bg text-text-dark font-sans flex flex-col min-h-screen">
        {/* React Hot Toast notifications container */}
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

        {/* Global Bookstore sticky header */}
        <Header />

        {/* Main interactive page content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Global Footer including clay newsletter subscription */}
        <Footer />
      </body>
    </html>
  );
}
