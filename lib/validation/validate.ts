// lib/validation/validate.ts
import { z, ZodSchema } from "zod";
import { NextResponse } from "next/server";

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const json = await request.json();
    const result = schema.safeParse(json);

    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: "Validation failed",
            // Returns exactly which field failed and why
            issues: result.error.issues.map((i) => ({
              field: i.path.join("."),
              message: i.message,
            })),
          },
          { status: 422 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}