import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function GET() {
  try {
    const url = cloudinary.utils.download_folder("app", {
      target_public_id: "backup",
    });
    return NextResponse.json({
      url: url,
      debug_info: "ZIP generado con flag de descarga forzada",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
