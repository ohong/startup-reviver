import type { Metadata } from "next";
import { Inter, PT_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ptMono = PT_Mono({
  variable: "--font-pt-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Startup of the Dead - Revive any YC startup",
  description: "Revive any YC startup from the previous batches",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${ptMono.variable} antialiased`}
        style={{
          fontFamily: 'var(--font-inter), var(--font-body)',
        }}
      >
        {children}
      </body>
    </html>
  );
}
