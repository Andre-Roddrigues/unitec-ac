import type { Metadata } from "next";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar/navbar";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/sections/footer/footer";

export const metadata: Metadata = {
  title: "Unitec Academy",
  description: "Formação e desenvolvimento profissional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-PT"
      className={cn("h-full", "antialiased", "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main>
          <NuqsAdapter>{children}</NuqsAdapter>
        </main>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
