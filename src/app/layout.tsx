import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/views/component/ThemeProvider";
import { AuthProvider } from "@/views/provider/AuthProvider";
import { Toaster } from "@/views/component/ui/Toaster";
import { ErrorBoundary } from "@/views/component/ErrorBoundary";
import NavigationHeader from "@/views/component/NavigationHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "주간업무보고 시스템",
  description: "간결하고 명확한 주간 업무 진행 상황을 관리하는 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <NavigationHeader />
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
