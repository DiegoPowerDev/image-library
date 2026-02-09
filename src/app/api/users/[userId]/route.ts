// app/api/users/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

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

const auth = getAuth();
const db = getFirestore();

// DELETE /api/users/[userId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params en Next.js 15+
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    console.log("🗑️ Eliminando usuario:", userId);

    // Eliminar de Firebase Auth
    await auth.deleteUser(userId);
    console.log("✅ Usuario eliminado de Firebase Auth");

    // Eliminar de Firestore
    await db.collection("users").doc(userId).delete();
    console.log("✅ Usuario eliminado de Firestore");

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error: any) {
    console.error("❌ Error eliminando usuario:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
