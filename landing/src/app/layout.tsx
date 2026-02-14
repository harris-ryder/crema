import type { Metadata } from "next";
import { Climate_Crisis, Inter } from "next/font/google";
import "./globals.css";

const climateCrisis = Climate_Crisis({
  variable: "--font-climate",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crema",
  description: "Crema - Coffee community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${climateCrisis.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
