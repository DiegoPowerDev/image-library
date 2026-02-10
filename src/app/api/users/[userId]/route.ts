import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { NextRequest, NextResponse } from "next/server";
const auth = getAuth();
const db = getFirestore();
if (!getApps().length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Faltan credenciales de Firebase Admin");
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    console.error("Error al inicializar Firebase Admin:", error);
    throw error;
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    // Await params en Next.js 15+
    const { userId } = await params;
    console.log("api:", userId);
    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 },
      );
    }
    await db.collection("users").doc(userId).delete();
    console.log("✅ Firestore: Documento eliminado");

    try {
      await auth.deleteUser(userId);
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
