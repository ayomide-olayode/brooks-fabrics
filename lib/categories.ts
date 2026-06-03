import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import { slugify } from "@/lib/utils";

export async function getCategoryMap(): Promise<Map<string, string>> {
  await connectDB();
  const categories: string[] = await Product.distinct("category");
  // Filter out any empty/null categories
  const validCategories = categories.filter(Boolean);
  return new Map(validCategories.map((cat) => [slugify(cat), cat]));
}
