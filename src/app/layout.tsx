import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HermesOS — Autonomous Business Automations",
  description: "Deploy AI agents that work while you sleep. Pick a template, connect your tools, set autonomy — and let AI handle the rest.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
