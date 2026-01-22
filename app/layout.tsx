import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/src/components/QueryProvider";

export const metadata: Metadata = {
  title: "ระบบประเมินครูผู้สอน",
  description: "ระบบสำหรับการประเมินครูผู้สอนโดยนักเรียน",
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
