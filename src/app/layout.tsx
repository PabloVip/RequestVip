import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import * as Sentry from '@sentry/nextjs';
import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    other: {
      ...Sentry.getTraceData()
    }
  };
}

export const metadata: Metadata = {
  title: 'TuneVIP',
  description: 'Pide canciones al DJ',
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('tunedrop_theme');
    var mode = stored || 'system';
    var resolved = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    document.documentElement.setAttribute('data-theme', resolved);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
