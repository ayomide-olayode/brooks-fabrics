import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DeliveryNotice from "@/components/ui/DeliveryNotice";
import PushNotificationManager from "@/components/PushNotificationManager";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import CartDrawer from "@/components/ui/CartDrawer";
import { getServerSession } from "next-auth";
import { customerAuthOptions } from "@/lib/auth/customerAuth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(customerAuthOptions);

  return (
    <CustomerAuthProvider session={session}>
      <WishlistProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen relative">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <DeliveryNotice />
            <PushNotificationManager />
          </div>
          <CartDrawer />
        </CartProvider>
      </WishlistProvider>
    </CustomerAuthProvider>
  );
}
