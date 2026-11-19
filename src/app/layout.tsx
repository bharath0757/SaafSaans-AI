import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { headers } from "next/headers";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaafSaans — clearer choices for smog days",
  description:
    "A GenAI assistant that helps families and communities navigate severe winter smog with low-emission routines, indoor air hacks, and impact you can verify.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F1F4F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0E161A" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Root layout. Dynamic so CSP nonces from proxy apply to framework scripts.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const headerStore = await headers();
  const nonce = headerStore.get("x-nonce") ?? undefined;

  return (
    <html lang="en">
      <body className="min-h-screen antialiased" data-nonce={nonce}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
