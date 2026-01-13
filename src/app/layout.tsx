// Root layout - locale-specific layout handles the actual rendering
// This file is required by Next.js but the [locale]/layout.tsx handles content
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
