import { adminAuth } from "@/lib/firebase-admin"; // Importación corregida
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    console.log("api:", userId);
    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 },
      );
    }
    try {
      await adminAuth.deleteUser(userId);
      console.log("✅ Auth: Usuario eliminado");
    } catch (authError: any) {
      if (authError.code === "auth/user-not-found") {
        console.warn(
          "⚠️ El usuario no existía en Auth, pero se limpió Firestore.",
        );
      } else {
        console.log("error:", authError);
        throw authError;
      }
    }
    return NextResponse.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error: any) {
    console.error("❌ Error eliminando usuario:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar usuario" },
      { status: 500 },
    );
  }
}
