import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true }, // price per yard at time of order
    quantity: { type: Number, required: true, min: 1 }, // yards
    image: { type: String },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["new", "processing", "delivered", "cancelled"],
      default: "new",
    },
    paystackReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true },
);

OrderSchema.index({ paystackReference: 1 });
OrderSchema.index({ email: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ orderStatus: 1 });

const Order =
  (mongoose.models.Order as any) || mongoose.model("Order", OrderSchema);

export default Order;
