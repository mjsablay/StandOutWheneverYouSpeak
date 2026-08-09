import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/mock-auth";
import { ViewAsProvider } from "@/lib/view-as";
import ViewAsBar from "@/components/ViewAsBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stand Out Whenever You Speak — Speak with impact and influence",
  description:
    "Learn the structure, practice with an AI coach and real peers, and perform when it counts. Public speaking training from Barry Kuntz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <AuthProvider>
          <ViewAsProvider>
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
            <ViewAsBar />
          </ViewAsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
