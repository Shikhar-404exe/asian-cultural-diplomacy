import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Asian Cultural Diplomacy | Digital Publication & Dialogue Platform',
  description:
    'A professional digital publication and community platform dedicated to Asian Cultural Diplomacy, intercultural dialogue, and shared heritage across diverse Asian civilizations.',
  keywords: [
    'Asian Cultural Diplomacy',
    'Cultural Diplomacy',
    'Intercultural Dialogue',
    'Asian Heritage',
    'East Asian Studies',
    'South Asian Studies',
    'International Relations',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-brand-ivory text-slate-800 antialiased flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
