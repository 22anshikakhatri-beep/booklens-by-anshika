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
        {/* Storybook display + elegant body serif */}
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cormorant+Garamond:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      {/* deep brown canvas, parchment text */}
      <body className="antialiased bg-[color:var(--coffee-950)] text-[color:var(--parchment)]">
        {children}
      </body>
    </html>
  );
}
