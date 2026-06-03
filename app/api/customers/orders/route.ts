import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { customerAuthOptions } from "@/lib/auth/customerAuth";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(customerAuthOptions);
    if (!session?.user?.id || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const orders = await Order.find({ customerId: session.user.id })
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    return NextResponse.json({ orders });
  } catch (error) {
    logger.error("Failed to fetch customer orders", { error });
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
