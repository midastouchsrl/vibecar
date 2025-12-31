import type { Metadata, Viewport } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "VibeCar - Valutazione Auto Usate",
  description: "Scopri il valore della tua auto usata in pochi secondi. Valutazione gratuita basata su annunci reali del mercato italiano.",
  keywords: ["valutazione auto", "auto usate", "prezzo auto", "quotazione auto", "vendere auto"],
  openGraph: {
    title: "VibeCar - Quanto vale la tua auto?",
    description: "Valutazione gratuita basata su annunci reali del mercato italiano.",
    type: "website",
    locale: "it_IT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark">
      <body className={`${outfit.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
