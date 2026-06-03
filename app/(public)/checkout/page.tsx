"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useStockCheck } from "@/hooks/useStockCheck";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import toast from "react-hot-toast";
import Image from "next/image";
import EmptyState from "@/components/ui/EmptyState";
import { ShieldCheck, Lock, Check } from "lucide-react";

const STEPS = ["Details", "Payment"];

export default function CheckoutPage() {
  const { cart, cartSubtotal, dispatch } = useCart();
  const [loading, setLoading] = useState(false);
  const { checking, validate } = useStockCheck();

  const [locations, setLocations] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [isInternational, setIsInternational] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  
  const { isAuthenticated, customer } = useCustomerAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/delivery-locations?activeOnly=true");
        if (res.ok) {
          const data = await res.json();
          setLocations(data.locations || []);
        }
      } catch (err) {
        console.error("Failed to load delivery locations", err);
      }
    }

    async function fetchAddresses() {
      if (!isAuthenticated) return;
      try {
        const res = await fetch("/api/customers/addresses");
        if (res.ok) {
          const data = await res.json();
          setSavedAddresses(data.addresses || []);
        }
      } catch (err) {
        console.error("Failed to load saved addresses", err);
      }
    }

    fetchLocations();
    fetchAddresses();
  }, [isAuthenticated]);

  if (!cart.items.length) {
    return (
      <div className="page-container py-10">
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          description="Add some fabrics before checking out."
          cta={{ href: "/shop", label: "Shop Now" }}
        />
      </div>
    );
  }

  const selectedLoc = locations.find((l) => l._id === selectedLocationId);
  const deliveryFee = isInternational ? 0 : (selectedLoc?.fee || 0);
  const total = cartSubtotal + deliveryFee;

  const busy = loading || checking;

  async function onSubmit(data: any) {
    if (isInternational) {
      const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2340000000000";
      const lines = cart.items
        .map(
          (item) =>
            `- ${item.name} (${item.quantity} items) – ${formatCurrency(item.price * item.quantity)}`
        )
        .join("\n");
      const message = `Hello, I'd like to place an INTERNATIONAL ORDER:\n\nCustomer: ${data.fullName}\nEmail: ${data.email}\nPhone: ${data.phone}\nAddress: ${data.address}\n\nItems:\n${lines}\n\nSubtotal: ${formatCurrency(cartSubtotal)}\n\nPlease advise me on international shipping costs and instructions. Thank you!`;

      window.location.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
      dispatch({ type: "CLEAR_CART" });
      return;
    }

    if (!selectedLocationId) {
      toast.error("Please select a delivery location for local orders.");
      return;
    }

    setLoading(true);
    try {
      const stockOk = await validate(cart.items);
      if (!stockOk) { setLoading(false); return; }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          items: cart.items,
          deliveryLocationId: selectedLocationId,
          saveAddress: saveAddress && isAuthenticated && savedAddresses.length < 5,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Checkout failed. Please try again.");
        return;
      }

      window.location.href = json.authorization_url;
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface min-h-screen">
      {/* Progress Bar */}
      <div className="bg-white border-b border-border-light">
        <div className="max-w-3xl mx-auto px-5 py-6">
          <div className="flex items-center justify-center gap-4">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i === 0
                    ? "bg-primary-600 text-white"
                    : "bg-surface-muted text-ink-muted"
                }`}>
                  {i === 0 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${
                  i === 0 ? "text-ink" : "text-ink-muted"
                }`}>
                  {step}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="w-16 sm:w-24 h-px bg-border mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-heading text-display-md font-bold text-ink mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Form — wider column */}
            <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-6">
              <div className="card p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold text-ink">
                    Delivery Details
                  </h2>
                  {isAuthenticated && savedAddresses.length > 0 && (
                    <select
                      className="input-field py-1.5 px-3 text-sm max-w-[200px]"
                      onChange={(e) => {
                        const addr = savedAddresses.find((a) => a._id === e.target.value);
                        if (addr) {
                          setValue("fullName", addr.fullName, { shouldValidate: true });
                          setValue("phone", addr.phone, { shouldValidate: true });
                          setValue("address", addr.address, { shouldValidate: true });
                          setValue("email", customer?.email || "", { shouldValidate: true });
                          
                          if (addr.deliveryLocationId) {
                            setSelectedLocationId(addr.deliveryLocationId);
                          }
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Use saved address...</option>
                      {savedAddresses.map((addr) => (
                        <option key={addr._id} value={addr._id}>
                          {addr.label} - {addr.address.substring(0, 20)}...
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="label">Full Name <span className="text-red-400">*</span></label>
                  <input
                    {...register("fullName", { required: "Full name is required" })}
                    className="input-field"
                    placeholder="e.g. Amaka Obi"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.fullName.message as string}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Email <span className="text-red-400">*</span></label>
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email",
                        },
                      })}
                      type="email"
                      className="input-field"
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.email.message as string}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Phone <span className="text-red-400">*</span></label>
                    <input
                      {...register("phone", { required: "Phone number is required" })}
                      type="tel"
                      className="input-field"
                      placeholder="+234 800 000 0000"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.phone.message as string}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">Full Address <span className="text-red-400">*</span></label>
                  <textarea
                    {...register("address", {
                      required: "Delivery address is required",
                    })}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="House number, street, city, state/country"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.address.message as string}
                    </p>
                  )}
                </div>

                {isAuthenticated && savedAddresses.length < 5 && (
                  <label className="flex items-center gap-2 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded border-border focus:ring-primary-500 cursor-pointer"
                    />
                    <span className="text-sm text-ink-secondary">Save this address for future use</span>
                  </label>
                )}
              </div>

              {/* Location / International */}
              <div className="card p-6 sm:p-8 space-y-5">
                <h3 className="font-heading text-lg font-bold text-ink">Delivery Zone</h3>

                <label
                  htmlFor="isInternational"
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface-warm cursor-pointer hover:border-gold-400 transition-colors"
                >
                  <input
                    type="checkbox"
                    id="isInternational"
                    checked={isInternational}
                    onChange={(e) => {
                      setIsInternational(e.target.checked);
                      if (e.target.checked) setSelectedLocationId("");
                    }}
                    className="w-5 h-5 text-primary-600 rounded-md border-border focus:ring-primary-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-ink font-semibold text-sm">International Order</span>
                    <p className="text-ink-muted text-xs mt-0.5">Orders outside Nigeria are processed via WhatsApp</p>
                  </div>
                </label>

                {!isInternational && (
                  <div>
                    <label className="label text-sm">Delivery Zone (Nigeria) <span className="text-red-400">*</span></label>
                    <select
                      className="input-field"
                      value={selectedLocationId}
                      onChange={(e) => setSelectedLocationId(e.target.value)}
                      disabled={isInternational}
                      required={!isInternational}
                    >
                      <option value="" disabled>Select your delivery area</option>
                      {locations.map((loc) => (
                        <option key={loc._id} value={loc._id}>
                          {loc.name} (+{formatCurrency(loc.fee)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || busy || (!isInternational && !selectedLocationId)}
                className="btn-primary w-full text-base py-4 gap-2"
              >
                <Lock className="w-4 h-4" />
                {isInternational
                  ? "Complete Order via WhatsApp"
                  : busy
                    ? (checking ? "Checking stock…" : "Preparing payment…")
                    : `Pay ${formatCurrency(total)}`}
              </button>

              <p className="text-xs text-ink-muted text-center px-4 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
                {isInternational
                  ? "You'll be redirected to WhatsApp to complete your bespoke order."
                  : "Secure payment via Paystack. You'll be redirected after clicking Pay."
                }
              </p>
            </form>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="card p-6 h-fit space-y-5 sticky top-28">
                <h2 className="font-heading text-xl font-bold text-ink">Order Summary</h2>

                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-muted shrink-0 border border-border-light">
                        <Image
                          src={item.image || "/placeholder-fabric.jpg"}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-ink shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="divider-warm" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-ink-secondary">
                    <span>Subtotal</span>
                    <span className="font-medium text-ink">{formatCurrency(cartSubtotal)}</span>
                  </div>

                  <div className="flex justify-between text-ink-secondary">
                    <span>Delivery</span>
                    <span className="font-medium text-ink">
                      {isInternational ? "To be calculated" : formatCurrency(deliveryFee)}
                    </span>
                  </div>

                  <div className="divider-warm my-2" />

                  <div className="flex justify-between font-bold text-ink text-lg">
                    <span>Total</span>
                    <span className="text-primary-600">
                      {isInternational ? formatCurrency(cartSubtotal) : formatCurrency(total)}
                    </span>
                  </div>
                  {isInternational && (
                    <p className="text-xs text-ink-muted text-right italic">+ International Shipping</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
