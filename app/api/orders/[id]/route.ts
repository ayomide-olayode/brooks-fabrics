import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET(request: any, props: any) {
  const params = await props.params;
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    await connectDB();
    const order = await Order.findById(params.id).lean();
    if (!order)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: any, props: any) {
  const params = await props.params;
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    await connectDB();
    const body = await request.json();
    const { orderStatus } = body;

    const validStatuses = ["new", "processing", "delivered", "cancelled"];
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 },
      );
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { ...(orderStatus && { orderStatus }) },
      { new: true },
    );

    if (!order)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { logAdminAction } = await import("@/lib/logger/audit");
    logAdminAction({
      adminEmail: auth.session.user.email || "unknown",
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
      action: "UPDATE",
      resource: "Order",
      resourceId: order._id.toString(),
      details: { newStatus: orderStatus },
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
