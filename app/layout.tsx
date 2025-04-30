import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./clientLayout";
import { AuthProvider } from "@/lib/auth";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "NexDo — Smart Task Manager",
  description: "NexDo helps you manage tasks, organize your day, and boost productivity with a clean and intuitive interface.",
  keywords: ["task manager", "todo app", "productivity", "NexDo", "task planner", "nextjs app"],
  authors: [{ name: "NexDo Team", url: "https://nexdo.app" }],
  creator: "NexDo",
  applicationName: "NexDo",
  metadataBase: new URL("https://nexdo.app"),
  openGraph: {
    title: "NexDo — Smart Task Manager",
    description: "Boost your productivity with NexDo. Organize tasks, set priorities, and get more done.",
    url: "https://nexdo.app",
    siteName: "NexDo",
    images: [
      {
        url: "https://nexdo.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "NexDo Task Manager Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexDo — Smart Task Manager",
    description: "Organize your tasks like a pro with NexDo.",
    creator: "@nexdoapp",
    images: ["https://nexdo.app/og-image.png"],
  },
  themeColor: "#4F46E5",
  icons: {
    icon: "/logo.svg",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{
        fontFamily: 'Roboto'
      }} className={`${roboto.variable} ${robotoMono.variable} antialiased`}>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
