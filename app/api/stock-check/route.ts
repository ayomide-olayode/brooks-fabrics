import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import { StockCheckSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/validate";

// POST /api/stock-check
// Body: { items: [{ productId, quantity }] }
// Returns validation errors for any out-of-stock or insufficient stock items
export async function POST(request: Request) {
  try {
    const validation = await validateBody(request, StockCheckSchema);
    if (!validation.success) return validation.response;

    await connectDB();
    const items = validation.data.items ?? [];

    if (items.length === 0) {
      return NextResponse.json({ valid: true, errors: [] });
    }

    const errors = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).lean();

      if (!product) {
        errors.push({
          productId: item.productId,
          message: `"${item.name || "Product"}" no longer exists.`,
        });
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push({
          productId: item.productId,
          name: product.name,
          available: product.stock,
          requested: item.quantity,
          message:
            product.stock === 0
              ? `"${product.name}" is out of stock.`
              : `Only ${product.stock} yard${product.stock !== 1 ? "s" : ""} of "${product.name}" available.`,
        });
      }
    }

    return NextResponse.json({ valid: errors.length === 0, errors });
  } catch (err) {
    return NextResponse.json({ error: "Stock check failed" }, { status: 500 });
  }
}
