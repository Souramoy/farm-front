import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import type { Metadata, Viewport } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Updated hard-coded frontend URL per request (no env override)
const SITE_URL = 'https://farm-front-pink.vercel.app/';

export const metadata: Metadata = {
  title: "Farm Management",
  description:
    "A modern farm management system to track crops, livestock, expenses, and resources efficiently. Optimized for offline use with PWA support.",
  applicationName: "Farm Management",
  manifest: "/manifest.json",
  metadataBase: new URL(SITE_URL),
  appleWebApp: {
    capable: true,
    title: "Farm Management",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon512_rounded.png", sizes: "192x192", type: "image/png" },
      { url: "/icon512_rounded.png", sizes: "256x256", type: "image/png" },
      { url: "/icon512_rounded.png", sizes: "384x384", type: "image/png" },
      { url: "/icon512_rounded.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon512_maskable.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Farm Management",
    description:
      "Easily manage crops, livestock, and finances with our smart farm management web app.",
  url: SITE_URL,
    siteName: "Farm Management",
    images: [
      {
        url: "/icon512_rounded.png",
        width: 512,
        height: 512,
        alt: "Farm Management Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Farm Management",
    description:
      "Smart farm management system with offline support and PWA features.",
    images: ["/icon512_rounded.png"],
    creator: "@your_twitter",
  },
};

export const viewport: Viewport = {
  themeColor: "#008000", // brand green
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <footer className="text-center py-6 text-gray-400 bg-slate-950">
            © {new Date().getFullYear()} Spektr. All rights reserved.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
