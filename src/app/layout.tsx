import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { cn } from "@/lib/utils";
import './globals.css';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DNA - Deep Narrative Analysis | Análise Psicológica Avançada',
  description: 'Plataforma profissional de análise narrativa profunda usando IA avançada. Descubra padrões psicológicos através da sua narrativa pessoal.',
  keywords: [
    'análise psicológica', 
    'DNA narrativo', 
    'personalidade', 
    'inteligência artificial', 
    'psicologia', 
    'autoconhecimento',
    'análise de personalidade',
    'big five',
    'valores de schwartz',
    'análise comportamental'
  ],
  authors: [{ name: 'DNA Analysis Team' }],
  creator: 'DNA Analysis Platform',
  publisher: 'DNA Analysis Platform',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://dna-analysis.com',
    title: 'DNA - Deep Narrative Analysis',
    description: 'Análise psicológica profissional através da narrativa pessoal',
    siteName: 'DNA Analysis',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DNA - Deep Narrative Analysis',
    description: 'Análise psicológica profissional através da narrativa pessoal',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#22c55e' },
    { media: '(prefers-color-scheme: dark)', color: '#22c55e' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased overflow-x-hidden",
        fontSans.variable,
        fontMono.variable
      )}>
        <div className="relative">
          {children}
        </div>
      </body>
    </html>
  );
}