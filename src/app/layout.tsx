import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "日本人妻のコミュニティ",
  description: "韓国に居住する日本人の奥様のためのコミュニティサイト。地図で他の会員と出会い、情報を共有しましょう。",
  keywords: "日本人妻, コミュニティ, 韓国生活, 日本人, 韓国在住, 地図, 交流",
  authors: [{ name: "日本人妻のコミュニティ" }],
  creator: "日本人妻のコミュニティ",
  publisher: "日本人妻のコミュニティ",
  robots: "index, follow",
  openGraph: {
    title: "日本人妻のコミュニティ",
    description: "韓国に居住する日本人の奥様のためのコミュニティサイト。地図で他の会員と出会い、情報を共有しましょう。",
    type: "website",
    locale: "ja_JP",
    siteName: "日本人妻のコミュニティ",
  },
  twitter: {
    card: "summary_large_image",
    title: "日本人妻のコミュニティ",
    description: "韓国に居住する日本人の奥様のためのコミュニティサイト",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-pink-50`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
