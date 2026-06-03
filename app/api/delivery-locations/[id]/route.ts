import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import DeliveryLocation from "@/lib/db/models/DeliveryLocation";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { DeliveryLocationUpdateSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/validate";

export async function GET(request: Request, props: any) {
  const params = await props.params;
  try {
    await connectDB();
    const location = await DeliveryLocation.findById(params.id).lean();
    if (!location)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ location });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: any) {
  const params = await props.params;
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const validation = await validateBody(
      request,
      DeliveryLocationUpdateSchema,
    );
    if (!validation.success) return validation.response;

    await connectDB();
    const updates = validation.data;

    const location = await DeliveryLocation.findByIdAndUpdate(
      params.id,
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!location)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { logAdminAction } = await import("@/lib/logger/audit");
    logAdminAction({
      adminEmail: auth.session.user.email || "unknown",
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
      action: "UPDATE",
      resource: "DeliveryLocation",
      resourceId: location._id.toString(),
      details: { changedFields: Object.keys(updates) },
    });

    return NextResponse.json({ location });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, props: any) {
  const params = await props.params;
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    await connectDB();
    const location = await DeliveryLocation.findByIdAndDelete(params.id);

    if (!location)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { logAdminAction } = await import("@/lib/logger/audit");
    logAdminAction({
      adminEmail: auth.session.user.email || "unknown",
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
      action: "DELETE",
      resource: "DeliveryLocation",
      resourceId: location._id.toString(),
      details: { name: location.name },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 },
    );
  }
}
