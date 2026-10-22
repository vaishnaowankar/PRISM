import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PRISM | Agentic Purple Teaming",
  description: "Proactive Red-Blue Intelligent Security Model",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 relative overflow-y-auto bg-[var(--background)] p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
