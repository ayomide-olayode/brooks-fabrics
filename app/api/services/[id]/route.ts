import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Service from "@/lib/db/models/Service";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ServiceUpdateSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/validate";

// GET /api/services/[id] — public (not strictly needed but good for dynamic routing)
export async function GET(request: Request, context: any) {
  try {
    await connectDB();
    const { id } = await context.params;
    const service = await Service.findById(id).lean();
    if (!service)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ service });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/services/[id] — admin only
export async function PATCH(request: Request, context: any) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await context.params;
    const validation = await validateBody(request, ServiceUpdateSchema);
    if (!validation.success) return validation.response;

    await connectDB();

    const service = await Service.findByIdAndUpdate(id, validation.data, {
      new: true,
    });

    if (!service)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { logAdminAction } = await import("@/lib/logger/audit");
    logAdminAction({
      adminEmail: auth.session.user.email || "unknown",
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
      action: "UPDATE",
      resource: "Service",
      resourceId: service._id.toString(),
      details: { changedFields: Object.keys(validation.data) },
    });

    return NextResponse.json({ service });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate slug error" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE /api/services/[id] — admin only
export async function DELETE(request: Request, context: any) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const { id } = await context.params;
    await connectDB();

    const service = await Service.findByIdAndDelete(id);
    if (!service)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { logAdminAction } = await import("@/lib/logger/audit");
    logAdminAction({
      adminEmail: auth.session.user.email || "unknown",
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
      action: "DELETE",
      resource: "Service",
      resourceId: service._id.toString(),
      details: { name: service.name },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
