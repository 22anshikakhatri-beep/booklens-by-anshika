import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book Burrow",
  description: "Book recommendations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Serif display for the hero title */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased text-neutral-50 bg-neutral-950">
        {children}
      </body>
    </html>
  );
}
