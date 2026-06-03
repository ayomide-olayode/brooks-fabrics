// lib/validation/schemas.ts
import { z } from "zod";

export const CheckoutSchema = z.object({
  customerName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  address: z.string().min(5).max(300),
  deliveryLocationId: z.string().optional(), // looked up server-side, fee never trusted from client
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        name: z.string().min(1),
        quantity: z.number().int().min(1).max(100),
        // 🟡 price and image intentionally omitted — fetched from DB, not trusted from client
      }),
    )
    .min(1, "Cart cannot be empty"),
  saveAddress: z.boolean().optional(),
});

// Only the fields callers are allowed to change — nothing else gets through
export const ServiceUpdateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    shortDescription: z.string().max(500).optional(),
    image: z.string().url().optional(),
    isFeatured: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const DeliveryLocationCreateSchema = z.object({
  name: z.string().min(1).max(200),
  fee: z.coerce.number().nonnegative().max(100_000),
  isActive: z.boolean().optional(),
});

export const DeliveryLocationUpdateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    fee: z.coerce.number().nonnegative().max(100_000).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const StockCheckSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(100),
        name: z.string().min(1).optional(),
      }),
    )
    .optional(),
});

// Infer TypeScript types directly from schemas — no duplication
export type CheckoutBody = z.infer<typeof CheckoutSchema>;
export type ServiceUpdateBody = z.infer<typeof ServiceUpdateSchema>;
export type DeliveryLocationCreateBody = z.infer<
  typeof DeliveryLocationCreateSchema
>;
export type DeliveryLocationUpdateBody = z.infer<
  typeof DeliveryLocationUpdateSchema
>;
export type StockCheckBody = z.infer<typeof StockCheckSchema>;

export const ProductCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(5000).optional(),
  pricePerYard: z.coerce.number().min(0, "Price must be at least 0"),
  stock: z.coerce.number().int().min(0, "Stock must be at least 0"),
  images: z.array(z.string().url()).optional(),
  category: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const OrderQuerySchema = z.object({
  status: z.enum(["new", "processing", "delivered", "cancelled"]).optional(),
});

export type ProductCreateBody = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateBody = z.infer<typeof ProductUpdateSchema>;

// ── Customer Schemas ─────────────────────────────────────────────────────────

export const CustomerRegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const CustomerLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const CustomerProfileUpdateSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().min(7).max(20).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const AddressSchema = z.object({
  label: z.string().min(1, "Label is required").max(50),
  fullName: z.string().min(2, "Full name is required").max(100),
  phone: z.string().min(7, "Phone number is required").max(20),
  address: z.string().min(5, "Address is required").max(300),
  deliveryLocationId: z.string().optional(),
});

export const CartUpdateSchema = z.object({
  cart: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(100),
    })
  ).max(50, "Maximum 50 items allowed in cart"),
});

export type CustomerRegisterBody = z.infer<typeof CustomerRegisterSchema>;
export type CustomerLoginBody = z.infer<typeof CustomerLoginSchema>;
export type CustomerProfileUpdateBody = z.infer<typeof CustomerProfileUpdateSchema>;
export type ChangePasswordBody = z.infer<typeof ChangePasswordSchema>;
export type AddressBody = z.infer<typeof AddressSchema>;
export type CartUpdateBody = z.infer<typeof CartUpdateSchema>;
