import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Snippetle 🎵 - Guess the Song from 0.1s',
  description: 'Can you guess the song from just 0.1 seconds? Features 3 daily challenge songs per category & genre, resetting strictly at IST Midnight.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className="bg-songless-bg text-songless-text antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
