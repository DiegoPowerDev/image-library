import { NextResponse } from "next/server";

export async function GET() {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const formattedKey = rawKey
    ? rawKey.replace(/"/g, "").replace(/\\n/g, "\n")
    : undefined;
  return NextResponse.json({
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    privateKey: formattedKey,
  });
}
