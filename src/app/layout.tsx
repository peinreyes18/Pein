import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import TextSizeWrapper from '@/components/TextSizeWrapper';

export const metadata: Metadata = {
  title: 'Italiano - Matuto ng Italyano',
  description: 'Matuto ng Italyano mula sa Tagalog. Madali, masaya, at praktikal.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Italiano',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tl">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="antialiased">
        <TextSizeWrapper>
          <main className="mx-auto min-h-screen max-w-lg pb-24">
            {children}
          </main>
          <BottomNav />
        </TextSizeWrapper>
      </body>
    </html>
  );
}
