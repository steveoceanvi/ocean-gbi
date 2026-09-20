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
  title: {
    default: "Ocean Pest Control — GBI Collections",
    template: "%s · Ocean GBI",
  },
  description:
    "Private collections / AR tracker for Ocean Pest Control government invoices. Acknowledge PO, submit GVI Buy e-invoice, attach Fieldwork PDF, track to check.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#f3f5f7] text-foreground">
        {children}
      </body>
    </html>
  );
}
