import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DeliveryNotice from "@/components/ui/DeliveryNotice";

export default function PublicLayout({ children }: any) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <DeliveryNotice />
    </div>
  );
}
