import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ChatWidgetGate } from "@/components/chat/ChatWidgetGate";
import { Header } from "@/components/header";
import "./globals.css";
import "@/components/chat/styles.css";
import { Suspense } from "react";

// App metadata for SEO and social sharing
export const metadata: Metadata = {
  title: "Edge Intelligence Hub",
  description: "Análise de Anúncios Concorrentes",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <html lang="pt-BR" suppressHydrationWarning={true}>
        <body
          className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        >
          <QueryProvider>
            <ThemeProvider>
              {children}

              {/* Lazy load chat widget (only for signed-in users and allowed pages) */}
              <Suspense fallback={null}>
                <ChatWidgetGate />
              </Suspense>
            </ThemeProvider>
          </QueryProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
