import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Icebreakers 🎵 - Spotify Top-30 Music Mystery Party Game',
  description: 'The real-time multiplayer music mystery game. Link your Spotify Top 30, listen to 30s snippets, and guess which friend listens to the track!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-songless-bg text-songless-text antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
