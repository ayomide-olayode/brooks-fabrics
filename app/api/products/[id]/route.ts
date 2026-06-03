import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { slugify } from "@/lib/utils";
import { ProductUpdateSchema } from "@/lib/validation/schemas";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { logAdminAction } from "@/lib/logger/audit";

const CACHE_KEY = "brooks:products:cache";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const product = await Product.findById(params.id).lean();
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    logger.error("Failed to fetch product by ID", { id: params.id, error: err });
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const rawBody = await request.json();
    const parseResult = ProductUpdateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.format() },
        { status: 400 },
      );
    }

    const body = parseResult.data;

    await connectDB();

    // Regenerate slug if name changed
    if (body.name) {
      const existing = await Product.findById(params.id).lean();
      if (existing && existing.name !== body.name) {
        const baseSlug = slugify(body.name);
        let slug = baseSlug;
        let count = 0;
        while (await Product.exists({ slug, _id: { $ne: params.id } })) {
          count++;
          slug = `${baseSlug}-${count}`;
        }
        (body as any).slug = slug;
      }
    }

    const product = await Product.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    logAdminAction({
      adminEmail: auth.session.user.email || "unknown",
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
      action: "UPDATE",
      resource: "Product",
      resourceId: product._id.toString(),
      details: { changedFields: Object.keys(body) },
    });

    // Invalidate cache
    await redis.del(CACHE_KEY).catch((err) => {
      logger.warn("Failed to invalidate product cache", { error: err });
    });

    return NextResponse.json({ product });
  } catch (err) {
    logger.error("Failed to update product", { id: params.id, error: err });
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    await connectDB();
    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    logAdminAction({
      adminEmail: auth.session.user.email || "unknown",
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
      action: "DELETE",
      resource: "Product",
      resourceId: product._id.toString(),
      details: { name: product.name, originalData: product },
    });

    // Invalidate cache
    await redis.del(CACHE_KEY).catch((err) => {
      logger.warn("Failed to invalidate product cache", { error: err });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to delete product", { id: params.id, error: err });
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
