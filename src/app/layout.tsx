import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const tajawal = localFont({
  variable: "--font-tajawal",
  display: "swap",
  src: [
    { path: "./fonts/Tajawal-300.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Tajawal-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Tajawal-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Tajawal-700.ttf", weight: "700", style: "normal" },
    { path: "./fonts/Tajawal-800.ttf", weight: "800", style: "normal" },
    { path: "./fonts/Tajawal-900.ttf", weight: "900", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: {
    default: "ورّاق — أدوات PDF مجانية وآمنة في متصفحك",
    template: "%s | ورّاق",
  },
  description:
    "دمج، تقسيم، تحويل، وتحرير ملفات PDF مباشرة من متصفحك بدون رفع ملفاتك لأي سيرفر. سريع، مجاني، وخصوصيتك محفوظة بالكامل.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
