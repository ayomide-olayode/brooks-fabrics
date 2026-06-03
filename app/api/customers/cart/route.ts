import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { customerAuthOptions } from "@/lib/auth/customerAuth";
import connectDB from "@/lib/db/mongoose";
import Customer from "@/lib/db/models/Customer";
import Product from "@/lib/db/models/Product";
import { CartUpdateSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(customerAuthOptions);
    if (!session?.user?.id || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const customer = await Customer.findById(session.user.id).lean();
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const cart = (customer as any).cart || [];
    if (cart.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Fetch full product details
    const productIds = cart.map((item: any) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    
    const productMap = new Map();
    products.forEach((p: any) => productMap.set(p._id.toString(), p));

    // Combine cart quantities with product details
    const items = cart
      .map((item: any) => {
        const p = productMap.get(item.productId.toString());
        if (!p) return null; // product was deleted

        return {
          productId: p._id.toString(),
          name: p.name,
          price: p.pricePerYard,
          quantity: item.quantity,
          stock: p.stock,
          image: p.images?.[0] || "",
          slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), // basic slugify
        };
      })
      .filter(Boolean); // remove nulls

    return NextResponse.json({ items });
  } catch (error) {
    logger.error("Failed to fetch customer cart", { error });
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(customerAuthOptions);
    if (!session?.user?.id || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await request.json();
    const parseResult = CartUpdateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    await connectDB();
    const customer = await Customer.findByIdAndUpdate(
      session.user.id,
      { $set: { cart: parseResult.data.cart } },
      { new: true }
    );

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Cart updated" });
  } catch (error) {
    logger.error("Failed to update customer cart", { error });
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}
