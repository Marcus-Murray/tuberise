import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tuberise Analytics',
  description:
    'Advanced YouTube analytics with AI-powered insights and Notion integration',
  keywords: [
    'YouTube',
    'analytics',
    'AI',
    'insights',
    'Notion',
    'content creators',
  ],
  authors: [{ name: 'Tuberise Analytics Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Tuberise Analytics',
    description: 'Advanced YouTube analytics with AI-powered insights',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tuberise Analytics',
    description: 'Advanced YouTube analytics with AI-powered insights',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <div className="min-h-screen bg-background">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
