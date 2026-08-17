import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { slugify } from "@/lib/utils";
import { ProductCreateSchema } from "@/lib/validation/schemas";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { logAdminAction } from "@/lib/logger/audit";

const CACHE_KEY = "brooks:products:cache";

// GET /api/products — public, supports ?category=&featured=true
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const cacheField = `${category || "all"}:${featured || "false"}`;

    // Try cache first
    if (redis) {
      try {
        const cachedProducts = await redis.hget(CACHE_KEY, cacheField);
        if (cachedProducts) {
          return NextResponse.json({ products: cachedProducts });
        }
      } catch (cacheErr: unknown) {
        logger.warn("Redis cache read failed", { error: cacheErr });
      }
    }

    await connectDB();

    const query: { category?: string; isFeatured?: boolean } = {};
    if (category) query.category = category;
    if (featured === "true") query.isFeatured = true;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Set cache asynchronously (fire and forget)
    if (redis) {
      redis.hset(CACHE_KEY, { [cacheField]: products }).catch((err: unknown) => {
        logger.warn("Redis cache write failed", { error: err });
      });
    }

    return NextResponse.json({ products });
  } catch (err) {
    logger.error("Failed to fetch products", { error: err });
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

interface MongoDuplicateKeyError extends Error {
  code?: number;
  keyPattern?: Record<string, number>;
}

function isMongoDuplicateKeyError(err: unknown): err is MongoDuplicateKeyError {
  return typeof err === "object" && err !== null && "code" in err;
}

// POST /api/products — admin only
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const rawBody = await request.json();
    const parseResult = ProductCreateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.format() },
        { status: 400 },
      );
    }

    const { name, description, pricePerYard, stock, images, category, isFeatured } = parseResult.data;

    await connectDB();

    // Auto-generate unique slug
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 0;
    while (await Product.exists({ slug })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }

    const product = await Product.create({
      name,
      slug,
      description: description || "",
      pricePerYard,
      stock,
      images: images || [],
      category,
      isFeatured: Boolean(isFeatured),
    });

    logAdminAction({
      adminEmail: auth.session.user.email || "unknown",
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
      action: "CREATE",
      resource: "Product",
      resourceId: product._id.toString(),
      details: { name: product.name, price: product.pricePerYard },
    });

    // Invalidate cache
    if (redis) {
      await redis.del(CACHE_KEY).catch((err: unknown) => {
        logger.warn("Failed to invalidate product cache", { error: err });
      });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (isMongoDuplicateKeyError(err) && err.code === 11000) {
      const field = err.keyPattern
        ? Object.keys(err.keyPattern)[0] || "field"
        : "field";
      return NextResponse.json(
        { error: `A product with this ${field} already exists.` },
        { status: 409 },
      );
    }
    logger.error("Failed to create product", { error: err });
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
