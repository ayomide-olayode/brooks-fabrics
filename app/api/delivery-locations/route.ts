import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import DeliveryLocation from "@/lib/db/models/DeliveryLocation";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { DeliveryLocationCreateSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/validate";

// GET /api/delivery-locations — public (for checkout dropdown)
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly");

    const query: any = {};
    if (activeOnly === "true") query.isActive = true;

    const locations = await DeliveryLocation.find(query)
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ locations });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 },
    );
  }
}

// POST /api/delivery-locations — admin only
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const validation = await validateBody(
      request,
      DeliveryLocationCreateSchema,
    );
    if (!validation.success) return validation.response;

    await connectDB();
    const { name, fee, isActive } = validation.data;

    const location = await DeliveryLocation.create({
      name,
      fee,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    const { logAdminAction } = await import("@/lib/logger/audit");
    logAdminAction({
      adminEmail: auth.session.user.email || "unknown",
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
      action: "CREATE",
      resource: "DeliveryLocation",
      resourceId: location._id.toString(),
      details: { name: location.name, fee: location.fee },
    });

    return NextResponse.json({ location }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "A location with this name already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 },
    );
  }
}
