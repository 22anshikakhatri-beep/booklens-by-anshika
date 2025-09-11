import type { Metadata } from "next";
import "./globals.css";
import { Uncial_Antiqua, Lora } from "next/font/google";

const display = Uncial_Antiqua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});
const body = Lora({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Book Burrow",
  description: "Cozy, vibe-first book recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        {children}
      </body>
    </html>
  );
}
