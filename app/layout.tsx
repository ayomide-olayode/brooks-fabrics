import { Playfair_Display, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { baseMetadata } from "@/lib/seo";
import type { ReactNode } from "react";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd";
import CartDrawer from "@/components/ui/CartDrawer";
import { getServerSession } from "next-auth";
import { customerAuthOptions } from "@/lib/auth/customerAuth";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});
export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: "#D4A017",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession(customerAuthOptions);

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body
        className="font-sans bg-surface text-ink antialiased"
        suppressHydrationWarning
      >
        <CustomerAuthProvider session={session}>
          <WishlistProvider>
            <CartProvider>
              <OrganizationJsonLd />
              <WebsiteJsonLd />
              {children}
              <CartDrawer />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    borderRadius: "12px",
                    background: "#1A1A1A",
                    color: "#FDFBF7",
                    fontSize: "14px",
                    fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                    border: "1px solid rgba(212,160,23,0.15)",
                    boxShadow: "0 16px 48px rgba(26,26,26,0.12)",
                  },
                  success: {
                    iconTheme: { primary: "#059669", secondary: "#FDFBF7" },
                  },
                  error: {
                    iconTheme: { primary: "#ef4444", secondary: "#FDFBF7" },
                  },
                }}
              />
            </CartProvider>
          </WishlistProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
