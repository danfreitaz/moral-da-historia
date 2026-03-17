import type {Metadata} from 'next';
import { Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import './globals.css'; // Global styles

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  title: 'Moral da História',
  description: 'Histórias diárias com reflexões e narração, com design Barroco e Vitoriano.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${cormorant.variable}`}>
      <body className="font-cormorant bg-[#f4ecd8] text-[#2c1e16] min-h-screen selection:bg-[#8b0000] selection:text-[#f4ecd8]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
