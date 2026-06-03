import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { customerAuthOptions } from "@/lib/auth/customerAuth";
import connectDB from "@/lib/db/mongoose";
import Customer from "@/lib/db/models/Customer";
import { AddressSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/validate";
import { logger } from "@/lib/logger";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(customerAuthOptions);
    if (!session?.user?.id || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const customer = await Customer.findById(session.user.id).lean();
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ addresses: customer.addresses || [] });
  } catch (error) {
    logger.error("Failed to fetch customer addresses", { error });
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(customerAuthOptions);
    if (!session?.user?.id || session.user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validation = await validateBody(request, AddressSchema);
    if (!validation.success) return validation.response;

    const data = validation.data;

    await connectDB();
    const customer = await Customer.findById(session.user.id);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (customer.addresses.length >= 5) {
      return NextResponse.json({ error: "Maximum 5 addresses allowed" }, { status: 400 });
    }

    const newAddress = {
      ...data,
      deliveryLocationId: data.deliveryLocationId ? new mongoose.Types.ObjectId(data.deliveryLocationId) : undefined,
    };

    customer.addresses.push(newAddress as any);
    await customer.save();

    return NextResponse.json({ 
      message: "Address added successfully",
      address: customer.addresses[customer.addresses.length - 1]
    }, { status: 201 });
  } catch (error) {
    logger.error("Failed to add address", { error });
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 });
  }
}
