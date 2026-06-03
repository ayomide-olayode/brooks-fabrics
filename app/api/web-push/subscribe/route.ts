import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { customerAuthOptions } from "@/lib/auth/customerAuth";
import connectDB from "@/lib/db/mongoose";
import Customer from "@/lib/db/models/Customer";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(customerAuthOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if subscription already exists for this user to avoid duplicates
    const customer = await Customer.findById(session.user.id).select("pushSubscriptions");
    
    if (customer) {
      const exists = customer.pushSubscriptions?.some(
        (sub: any) => sub.endpoint === subscription.endpoint
      );

      if (!exists) {
        await Customer.findByIdAndUpdate(session.user.id, {
          $push: { pushSubscriptions: subscription },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error subscribing to web push:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
