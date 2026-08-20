import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hindi Songless 🇮🇳 - Name the Song from 0.1s',
  description: 'Can you guess the Hindi song from just 0.1 seconds? Features progressive audio guessing, daily challenges, and Spotify multi-user group modes.',
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
