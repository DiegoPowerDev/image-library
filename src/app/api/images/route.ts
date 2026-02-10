import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const id = formData.get("id") as string | null;

    if (!file || !id) {
      return NextResponse.json(
        { error: "File or id missing" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `app/${id}`,
          public_id: "image",
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      stream.end(buffer);
    });

    return NextResponse.json(uploadResult);
  } catch (error) {
    console.error("POST upload error:", error);
    return NextResponse.json(
      { error: "Error replacing image" },
      { status: 500 },
    );
  }
}
