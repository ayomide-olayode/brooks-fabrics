import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function POST(request: Request) {
  try {
    // Secure the upload endpoint
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const url = await uploadImage(dataUri, "brooks-fabrics/uploads");

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("[UPLOAD_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to upload to Cloudinary" },
      { status: 500 },
    );
  }
}
