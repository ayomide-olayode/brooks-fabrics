import mongoose, { Schema, type Document } from "mongoose";
import bcrypt from "bcryptjs";

interface CustomerAddress {
  _id: mongoose.Types.ObjectId;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  deliveryLocationId?: mongoose.Types.ObjectId;
}

interface CustomerCartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface CustomerDocument extends Document {
  name: string;
  email: string;
  password?: string;
  provider: "credentials" | "google";
  addresses: CustomerAddress[];
  defaultAddressId?: mongoose.Types.ObjectId;
  wishlist: mongoose.Types.ObjectId[];
  cart: CustomerCartItem[];
  pushSubscriptions: PushSubscriptionData[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema({
  label: { type: String, required: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  deliveryLocationId: { type: Schema.Types.ObjectId, ref: "DeliveryLocation" },
});

const CartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const PushSubscriptionSchema = new Schema(
  {
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { _id: false }
);

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    addresses: {
      type: [AddressSchema],
      default: [],
      validate: {
        validator: (val: CustomerAddress[]) => val.length <= 5,
        message: "Maximum 5 addresses allowed",
      },
    },
    defaultAddressId: { type: Schema.Types.ObjectId },
    wishlist: {
      type: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      default: [],
      validate: {
        validator: (val: mongoose.Types.ObjectId[]) => val.length <= 50,
        message: "Maximum 50 wishlist items allowed",
      },
    },
    cart: {
      type: [CartItemSchema],
      default: [],
    },
    pushSubscriptions: {
      type: [PushSubscriptionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Hash password before saving (only for credentials accounts)
CustomerSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords
CustomerSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};



const Customer =
  (mongoose.models.Customer as mongoose.Model<CustomerDocument>) ||
  mongoose.model<CustomerDocument>("Customer", CustomerSchema);

export default Customer;
export type { CustomerDocument, CustomerAddress };
