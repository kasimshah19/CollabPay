import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const sora = Sora({ 
  subsets: ["latin"], 
  weight: ["600", "700"],
  variable: "--font-sora",
});

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CollabPay",
  description: "Run campaigns. Pay creators. Every rupee tracked.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${sora.variable} ${inter.variable} font-body antialiased`}>
        <AuthProvider>
          <ToastProvider>
            <div className="max-w-content mx-auto px-page py-5">
              <Header />
              {children}
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
