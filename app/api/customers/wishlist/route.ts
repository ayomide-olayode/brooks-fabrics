import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { customerAuthOptions } from "@/lib/auth/customerAuth";
import connectDB from "@/lib/db/mongoose";
import Customer from "@/lib/db/models/Customer";
import mongoose from "mongoose";

// GET /api/customers/wishlist
// Returns the populated wishlist items for the logged-in customer
export async function GET() {
  try {
    const session = await getServerSession(customerAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const customer = await Customer.findById(session.user.id).populate("wishlist");

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ wishlist: customer.wishlist });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

// POST /api/customers/wishlist
// Adds an item to the wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(customerAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Valid productId is required" }, { status: 400 });
    }

    await connectDB();
    const customer = await Customer.findById(session.user.id);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Convert to ObjectId for comparison
    const objectId = new mongoose.Types.ObjectId(productId);

    // Prevent duplicates
    if (!customer.wishlist.some(id => id.equals(objectId))) {
      if (customer.wishlist.length >= 50) {
        return NextResponse.json({ error: "Wishlist is full (max 50)" }, { status: 400 });
      }
      customer.wishlist.push(objectId);
      await customer.save();
    }

    return NextResponse.json({ ok: true, wishlist: customer.wishlist });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

// DELETE /api/customers/wishlist
// Removes an item from the wishlist
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(customerAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Valid productId is required" }, { status: 400 });
    }

    await connectDB();
    const customer = await Customer.findById(session.user.id);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Convert to ObjectId for comparison
    const objectId = new mongoose.Types.ObjectId(productId);

    // Filter out the product
    customer.wishlist = customer.wishlist.filter(id => !id.equals(objectId));
    await customer.save();

    return NextResponse.json({ ok: true, wishlist: customer.wishlist });
  } catch (error) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
