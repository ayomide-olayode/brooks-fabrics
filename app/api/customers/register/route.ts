import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Customer from "@/lib/db/models/Customer";
import { CustomerRegisterSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";
import { sendWelcomeEmail } from "@/lib/emails";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const rawBody = await request.json();
    const parseResult = CustomerRegisterSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = parseResult.data;

    await connectDB();

    // Check for existing customer
    const existing = await Customer.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const customer = await Customer.create({
      name,
      email,
      password,
      provider: "credentials",
    });

    // Fire and forget email notification
    sendWelcomeEmail(customer.email, customer.name).catch((err) => {
      logger.error("Failed to send welcome email in background", { error: err });
    });

    logger.info("New customer registered", {
      customerId: customer._id.toString(),
      email: customer.email,
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        customer: {
          id: customer._id.toString(),
          name: customer.name,
          email: customer.email,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    logger.error("Customer registration failed", { error: err });
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
