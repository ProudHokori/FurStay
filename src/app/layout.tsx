import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FurStay",
  description: "Pet sitter marketplace built for the software architecture project",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
