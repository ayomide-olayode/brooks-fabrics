import mongoose from "mongoose";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";

export interface OrderItemInput {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderData {
  customerId?: string;
  customerName: string;
  email: string;
  phone?: string;
  address?: string;
  items: OrderItemInput[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "new" | "processing" | "delivered" | "cancelled";
}

type CreateOrderSuccess = { success: true; order: unknown };

type CreateOrderFailure = {
  success: false;
  reason: "duplicate" | "insufficient-stock";
  message?: string;
};

export type CreateOrderResult = CreateOrderSuccess | CreateOrderFailure;

export async function createOrderSafely(
  reference: string,
  orderData: OrderData,
): Promise<CreateOrderResult> {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const created = await Order.create(
      [
        {
          ...orderData,
          paystackReference: reference,
        },
      ],
      { session },
    );

    for (const item of orderData.items) {
      const result = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
        { session, new: true },
      );

      if (!result) {
        await session.abortTransaction();
        return {
          success: false,
          reason: "insufficient-stock",
          message: `Insufficient stock for product ${item.productId}`,
        };
      }
    }

    await session.commitTransaction();
    return { success: true, order: created[0] };
  } catch (error: unknown) {
    await session.abortTransaction();

    const errorCode = (error as { code?: number }).code;
    if (errorCode === 11000) {
      return { success: false, reason: "duplicate" };
    }

    throw error;
  } finally {
    session.endSession();
  }
}
