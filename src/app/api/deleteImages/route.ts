import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const folderPath = `app/${id}`;
    await cloudinary.api.delete_resources_by_prefix(folderPath);
    const result = await cloudinary.api.delete_folder(folderPath);
    console.log("eliminado de cloudinary");
    return NextResponse.json("result");
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Error deleting image" },
      { status: 500 },
    );
  }
}
