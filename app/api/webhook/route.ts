import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db/mongoose";
import { createOrderSafely } from "@/lib/orders/createOrderSafely";
import type { OrderData } from "@/lib/orders/createOrderSafely";
import { logger } from "@/lib/logger";
import { sendOrderConfirmationEmail } from "@/lib/emails";
// 🔴 Fix 1: Order was never imported — this would throw a ReferenceError at runtime
// but it's also now unnecessary — remove the manual check entirely (see Fix 2)
type PaystackMetaItem = {
  productId: string | number;
  name?: string;
  price?: number;
  quantity?: number;
  image?: unknown;
};
export async function POST(request: Request) {
  // 🔴 Fix 3: was untyped
  try {
    // 🔴 Fix 4: env var can be undefined — strict mode catches this, guard it explicitly
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      logger.error("PAYSTACK_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 },
      );
    }

    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // 🔴 Fix 5: signature can be null — guard before passing to timingSafeEqual
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");

    // 🔴 Fix 6: use timingSafeEqual instead of !== to prevent timing attacks
    const hashBuffer = Buffer.from(hash, "hex");
    const sigBuffer = Buffer.from(signature, "hex");
    const isValid =
      hashBuffer.length === sigBuffer.length &&
      crypto.timingSafeEqual(hashBuffer, sigBuffer);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const txn = event.data;
      const reference = txn.reference;

      await connectDB();

      // 🔴 Fix 2: removed the manual Order.findOne() idempotency check entirely.
      // It was a race condition (two requests could both pass before either wrote),
      // AND Order wasn't imported so it would have thrown a ReferenceError.
      // createOrderSafely() handles idempotency atomically via the unique index.

      const meta = txn.metadata;
      const items = Array.isArray(meta?.items) ? meta.items : [];

      const orderData: OrderData = {
        customerId: meta?.customer_id,
        customerName:
          meta?.customer_name || txn.customer?.first_name || "Customer",
        email: txn.customer?.email || "",
        phone: meta?.phone,
        address: meta?.address,
        items: items.map((item: PaystackMetaItem) => ({
          productId: String(item.productId),
          name: String(item.name ?? "Item"),
          price: Number(item.price ?? 0),
          quantity: Number(item.quantity ?? 0),
          image: typeof item.image === "string" ? item.image : "",
        })),
        subtotal: Number(meta?.subtotal ?? 0),
        deliveryFee: Number(meta?.delivery_fee ?? 0),
        total: Number(meta?.total ?? txn.amount / 100),
        paymentStatus: "paid",
        orderStatus: "new",
      };

      const result = await createOrderSafely(reference, orderData);

      if (!result.success && result.reason === "duplicate") {
        return NextResponse.json({ received: true }); // 🟡 Fix 7: don't expose `duplicate: true` to caller
      }

      if (!result.success) {
        return NextResponse.json(
          { error: result.message || "Order processing failed" },
          { status: 409 },
        );
      }

      // Await confirmation email
      try {
        await sendOrderConfirmationEmail(reference, orderData);
      } catch (err) {
        logger.error("Failed to send order confirmation email", { error: err });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error("Webhook processing failed", { error: err });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
