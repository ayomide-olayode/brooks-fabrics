import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    image: { type: String }, // Cloudinary URL
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ServiceSchema.index({ isFeatured: 1 });

const Service =
  (mongoose.models.Service as any) || mongoose.model("Service", ServiceSchema);

export default Service;
