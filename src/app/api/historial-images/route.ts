import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const id = formData.get("id") as string | null;
    const historyId = formData.get("historyId") as string | null;

    if (!file || !id || !historyId) {
      return NextResponse.json(
        { error: "File, id or historyId missing" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `app/${id}/${historyId}`,
            public_id: "image",
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error) {
    console.error("POST upload error:", error);
    return NextResponse.json(
      { error: "Error uploading history image" },
      { status: 500 }
    );
  }
}
