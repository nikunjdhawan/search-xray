import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Activity, Search } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Search Analytics Dashboard',
  description: 'Analytics dashboard for search engine performance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-8">
            <div className="flex space-x-6">
              <Link
                href="/"
                className="flex items-center space-x-2 font-medium transition-colors hover:text-foreground/80 text-foreground"
              >
                <Activity className="h-5 w-5" />
                <span>Search Logs</span>
              </Link>
              <Link
                href="/engines"
                className="flex items-center space-x-2 font-medium transition-colors hover:text-foreground/80 text-foreground"
              >
                <Search className="h-5 w-5" />
                <span>Engine Analytics</span>
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}