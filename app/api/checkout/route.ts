import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import DeliveryLocation from "@/lib/db/models/DeliveryLocation";
import { initializePayment } from "@/lib/paystack";
import { CheckoutSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/validate";
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth/next";
import { customerAuthOptions } from "@/lib/auth/customerAuth";
import mongoose from "mongoose";
import Customer from "@/lib/db/models/Customer";

export async function POST(request: Request) {
  // 🔴 Fix 2: validateBody consumes the request body stream internally.
  // The old request.json() call below would throw "body already consumed".
  // Solution: use validation.data for everything — delete the second request.json()
  const validation = await validateBody(request, CheckoutSchema);
  if (!validation.success) return validation.response;

  // 🔴 Fix 3: items and total were destructured here, then re-declared with
  // const inside the try block — duplicate declaration, TypeScript error.
  // Pull everything needed from validation.data in one place.
  const { items, deliveryLocationId, customerName, email, phone, address, saveAddress } =
    validation.data;

  try {
    await connectDB();

    // 🔴 Fix 4: deleted the second request.json() + manual customer/items checks.
    // Zod already enforced all of these — they were dead code that also
    // referenced `customer` from the consumed body stream (would have thrown).

    const validatedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId).lean();
      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.name}" no longer exists` },
          { status: 400 },
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Not enough stock for "${product.name}". Only ${product.stock} yards available.`,
          },
          { status: 409 }, // 🟡 Fix 5: 409 Conflict is more accurate than 400 for stock issues
        );
      }
      validatedItems.push({
        productId: product._id.toString(),
        name: product.name,
        price: product.pricePerYard,
        quantity: item.quantity,
        image: product.images?.[0] || "",
      });
    }

    const subtotal = validatedItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );

    // 🟡 Fix 6: always look up fee from DB — never trust the client-sent deliveryFee.
    // The validated deliveryFee from Zod is intentionally ignored here.
    let fee = 0;
    if (deliveryLocationId) {
      const loc = await DeliveryLocation.findById(deliveryLocationId).lean();
      // 🟡 Fix 7: guard loc.fee — could be 0, null, or negative in bad data
      if (loc && typeof loc.fee === "number" && loc.fee >= 0) fee = loc.fee;
    }

    if (fee === 0) {
      const envFee = parseInt(process.env.NEXT_PUBLIC_DELIVERY_FEE ?? "", 10);
      // 🔴 Fix 8: parseInt returns NaN on bad input — NaN in arithmetic silently
      // corrupts total. Guard with isNaN.
      fee = !isNaN(envFee) && envFee >= 0 ? envFee : 1000;
    }

    const total = subtotal + fee;
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Attempt to get user session
    let customerId: string | undefined;
    try {
      const session = await getServerSession(customerAuthOptions);
      if (session?.user?.id && session.user.role === "customer") {
        customerId = session.user.id;
      }
    } catch (e) {
      logger.error("Failed to get session during checkout", { error: e });
    }

    // Attempt to save address if requested and user is authenticated
    if (saveAddress && customerId) {
      try {
        const customer = await Customer.findById(customerId);
        if (customer && customer.addresses.length < 5) {
          customer.addresses.push({
            label: "Saved Address",
            fullName: customerName,
            phone,
            address,
            deliveryLocationId: deliveryLocationId ? new mongoose.Types.ObjectId(deliveryLocationId) : undefined,
          } as any);
          await customer.save();
        }
      } catch (e) {
        logger.error("Failed to save address during checkout", { error: e });
      }
    }

    const payment = await initializePayment({
      email,
      amountNGN: total,
      callbackUrl: `${baseUrl}/order-success`,
      metadata: {
        customer_name: customerName, // 🔴 Fix 9: was customer.fullName from deleted body parse
        customer_id: customerId, // Phase 3: Associate order with customer
        phone,
        address,
        items: validatedItems,
        subtotal,
        delivery_fee: fee,
        total,
      },
    });

    return NextResponse.json({
      authorization_url: payment.authorization_url,
      reference: payment.reference,
    });
  } catch (err) {
    logger.error("Checkout failed", { error: err });
    // 🔴 Fix 10: err is `unknown` in strict mode — err.message throws a type error
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
