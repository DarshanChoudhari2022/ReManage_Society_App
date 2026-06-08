import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ui/Toast";
import Script from "next/script";
import { I18nProvider } from "@/lib/i18n";
import PageTextTranslator from "@/components/ui/PageTextTranslator";
import { AppDialogProvider } from "@/components/ui/AppDialogProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3B82F6",
};

export const metadata: Metadata = {
  title: "SmartSocietyHub — Society Management Platform",
  description:
    "SmartSocietyHub is a complete society management ERP - billing, security, maintenance, community. Zero-cost UPI payments. By Buzyhub.in",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SmartSocietyHub",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta id="theme-color-meta" name="theme-color" content="#3B82F6" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem('theme');
                  var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var dark = stored ? stored === 'dark' : systemDark;
                  document.documentElement.classList.toggle('dark', dark);
                  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
                  var meta = document.querySelector('meta[name="theme-color"]');
                  if (meta) meta.setAttribute('content', dark ? '#0B1220' : '#3B82F6');
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ToastProvider />
        <I18nProvider>
          <AppDialogProvider>
            <PageTextTranslator />
            {children}
          </AppDialogProvider>
        </I18nProvider>
        <Script id="sw-register" strategy="lazyOnload">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(()=>{});
          }
        `}</Script>
      </body>
    </html>
  );
}
