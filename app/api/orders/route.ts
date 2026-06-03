import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { logger } from "@/lib/logger";
import { OrderQuerySchema } from "@/lib/validation/schemas";

// GET /api/orders — admin only, supports ?status=
export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const parseResult = OrderQuerySchema.safeParse({
      status: searchParams.get("status") || undefined,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid status query parameter", details: parseResult.error.format() },
        { status: 400 },
      );
    }

    const { status } = parseResult.data;

    await connectDB();

    const query: Record<string, string> = {};
    if (status) query.orderStatus = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return NextResponse.json({ orders });
  } catch (error) {
    logger.error("Failed to fetch orders", { error });
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
