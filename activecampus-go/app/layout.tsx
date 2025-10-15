
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";

const kenneyFont = localFont({
  src: '../public/fonts/Kenney Mini.ttf',
  variable: '--font-kenney',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "ActiveCAMPUS Go",
  description: "Campus management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={kenneyFont.variable} suppressHydrationWarning>
      <body className={kenneyFont.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}