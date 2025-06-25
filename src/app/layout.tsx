import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dither – Apply amazing dithering effect for any images",
  description: "A modern web app to apply customizable dithering effects (including Bayer, Floyd-Steinberg, and more) to your images. Export as PNG, JPEG, WEBP, or SVG.",
  openGraph: {
    title: "Dither – Apply amazing dithering effect for any images",
    description: "A modern web app to apply customizable dithering effects (including Bayer, Floyd-Steinberg, and more) to your images. Export as PNG, JPEG, WEBP, or SVG.",
    url: "https://yourdomain.com/",
    siteName: "Dither SVG App",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dither SVG App preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dither – Apply amazing dithering effect for any images",
    description: "A modern web app to apply customizable dithering effects (including Bayer, Floyd-Steinberg, and more) to your images. Export as PNG, JPEG, WEBP, or SVG.",
    images: ["/og-image.png"],
    creator: "@yourtwitter",
  },
  metadataBase: new URL("https://yourdomain.com/"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ colorScheme: 'dark' }}
      >
        {children}
      </body>
    </html>
  );
}
