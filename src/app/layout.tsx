// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from '@/components/providers/Providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlgoArena - Master Data Structures & Algorithms",
  description: "Learn, practice, and master data structures and algorithms with interactive problems, solutions, and real-time code execution.",
  keywords: ["algorithms", "data structures", "programming", "coding", "interview preparation"],
  authors: [{ name: "AlgoArena Team" }],
  creator: "AlgoArena",
  publisher: "AlgoArena",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AlgoArena - Master Data Structures & Algorithms",
    description: "Learn, practice, and master data structures and algorithms with interactive problems, solutions, and real-time code execution.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgoArena - Master Data Structures & Algorithms",
    description: "Learn, practice, and master data structures and algorithms with interactive problems, solutions, and real-time code execution.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}