import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    pricePerYard: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }], // Cloudinary URLs
    category: { type: String, trim: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fast lookups
ProductSchema.index({ category: 1 });
ProductSchema.index({ isFeatured: 1 });

const Product =
  (mongoose.models.Product as any) || mongoose.model("Product", ProductSchema);

export default Product;
