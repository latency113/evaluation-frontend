import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/src/components/QueryProvider";

export const metadata: Metadata = {
  title: "Teacher Evaluation System",
  description: "System for evaluating teachers by students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
