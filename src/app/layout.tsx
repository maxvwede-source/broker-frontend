import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "Broker Exchange",
  description: "Crypto Exchange Terminal",
};

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${jetbrainsMono.variable}`}>
      <body className="h-full overflow-hidden font-sans antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
