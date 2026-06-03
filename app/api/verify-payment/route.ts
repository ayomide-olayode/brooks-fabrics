import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";
import { verifyPayment } from "@/lib/paystack";
import { createOrderSafely } from "@/lib/orders/createOrderSafely";
import type { OrderData, OrderItemInput } from "@/lib/orders/createOrderSafely";

interface PaystackItemRecord {
  [key: string]: unknown;
}

function isRecord(value: unknown): value is PaystackItemRecord {
  return typeof value === "object" && value !== null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if order already created (idempotent)
    const existing = await Order.findOne({
      paystackReference: reference,
    }).lean();
    if (existing) {
      return NextResponse.json({ order: JSON.parse(JSON.stringify(existing)) });
    }

    // Verify with Paystack
    const txn = await verifyPayment(reference);

    if (txn.status !== "success") {
      return NextResponse.json(
        { error: "Payment was not successful" },
        { status: 400 },
      );
    }

    const meta = txn.metadata;
    const items = Array.isArray(meta?.items) ? meta.items : [];

    const orderData: OrderData = {
      customerName: meta?.customer_name || "Customer",
      email: txn.customer?.email || "",
      phone: meta?.phone,
      address: meta?.address,
      items: items.map((item): OrderItemInput => {
        const record = isRecord(item) ? item : {};
        return {
          productId: String(record["productId"] ?? ""),
          name: typeof record["name"] === "string" ? record["name"] : "Item",
          price: Number(record["price"] ?? 0),
          quantity: Number(record["quantity"] ?? 0),
          image: typeof record["image"] === "string" ? record["image"] : "",
        };
      }),
      subtotal: Number(meta?.subtotal ?? 0),
      deliveryFee: Number(meta?.delivery_fee ?? 0),
      total: Number(meta?.total ?? 0),
      paymentStatus: "paid",
      orderStatus: "new",
    };

    const result = await createOrderSafely(reference, orderData);

    if (!result.success) {
      if (result.reason === "duplicate") {
        const existingOrder = await Order.findOne({
          paystackReference: reference,
        }).lean();
        if (existingOrder) {
          return NextResponse.json({
            order: JSON.parse(JSON.stringify(existingOrder)),
          });
        }
        return NextResponse.json(
          { message: "Order already processed" },
          { status: 200 },
        );
      }

      if (result.reason === "insufficient-stock") {
        return NextResponse.json(
          { error: result.message || "Insufficient stock" },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Order creation failed" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      order: JSON.parse(JSON.stringify(result.order)),
    });
  } catch (err) {
    console.error("[VERIFY PAYMENT ERROR]", err);
    const message =
      err instanceof Error ? err.message : "Payment verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
