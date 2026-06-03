import mongoose from "mongoose";

const DeliveryLocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    fee: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const DeliveryLocation =
  (mongoose.models.DeliveryLocation as any) ||
  mongoose.model("DeliveryLocation", DeliveryLocationSchema);

export default DeliveryLocation;
