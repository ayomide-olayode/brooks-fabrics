import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Service from "@/lib/db/models/Service";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { slugify } from "@/lib/utils";

// GET /api/services — public
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");

    const query: any = {};
    if (featured === "true") query.isFeatured = true;

    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ services });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 },
    );
  }
}

// POST /api/services — admin only
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    await connectDB();
    const body = (await request.json()) as any;

    const { name, description, shortDescription, image, isFeatured } = body;

    if (!name || !description || !shortDescription) {
      return NextResponse.json(
        { error: "name, description, and shortDescription are required" },
        { status: 400 },
      );
    }

    // Auto-generate unique slug
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 0;
    while (await Service.exists({ slug })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }

    const service = await Service.create({
      name,
      slug,
      description,
      shortDescription,
      image: image || "",
      isFeatured: Boolean(isFeatured),
    });

    const { logAdminAction } = await import("@/lib/logger/audit");
    logAdminAction({
      adminEmail: auth.session.user.email || "unknown",
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
      action: "CREATE",
      resource: "Service",
      resourceId: service._id.toString(),
      details: { name: service.name },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Service slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 },
    );
  }
}
