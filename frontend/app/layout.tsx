import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f8f8fd",
};

export const metadata: Metadata = {
  title: "TASK Kanban & Workflow Management",
  description:
    "Modern intuitive Kanban board with fluid drag-and-drop collaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col font-sans selection:bg-pink-100 selection:text-pink-900"
        cz-shortcut-listen="true"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
