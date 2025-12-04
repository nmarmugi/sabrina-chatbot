import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sabrina Chatbot",
  description: "Talk with Sabrina Carpenter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
