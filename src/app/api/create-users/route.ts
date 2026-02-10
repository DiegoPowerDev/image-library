import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 },
      );
    }
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || email.split("@")[0],
      emailVerified: false,
    });

    console.log("✅ Usuario creado en Auth:", userRecord.uid);

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error: any) {
    console.error("❌ Error en API de creación:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear usuario" },
      { status: 500 },
    );
  }
}
