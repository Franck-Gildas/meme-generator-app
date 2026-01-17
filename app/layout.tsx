import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Meme Generator',
  description: 'Create and share memes with the community',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <nav>
            <Link href="/">Feed</Link>
            <Link href="/create">Create</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
