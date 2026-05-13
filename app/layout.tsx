import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"
import { StoreProvider } from "@/lib/store-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CartDrawer } from "@/components/cart-drawer"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Tanit Cuisine — Modern Nigerian Fine Dining, Delivered",
  description:
    "Premium Nigerian cuisine, prepared with heritage technique and modern craft. Order signature jollof, suya, soups and small chops, delivered hot.",
  generator: "v0.app",
  keywords: [
    "Nigerian food",
    "Tanit Cuisine",
    "jollof rice",
    "suya",
    "egusi",
    "Ilorin restaurant",
    "Kwara State restaurant",
    "fine dining",
    "Nigerian cuisine delivery",
  ],
  openGraph: {
    title: "Tanit Cuisine — Modern Nigerian Fine Dining",
    description:
      "Premium Nigerian cuisine, prepared with heritage technique and modern craft.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/tanit_logo.png", type: "image/png" },
    ],
    apple: "/tanit_logo.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#3a1f12",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <StoreProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CartDrawer />
          </StoreProvider>
        </AuthProvider>
        <Toaster position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
