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

    console.log("Firebase Admin inicializado correctamente");
  } catch (error) {
    console.error("Error al inicializar Firebase Admin:", error);
    throw error;
  }
}

const auth = getAuth();
const db = getFirestore();

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId y role son requeridos" },
        { status: 400 }
      );
    }

    // Actualizar custom claims
    await auth.setCustomUserClaims(userId, { role });

    // Actualizar en Firestore
    await db.collection("users").doc(userId).update({
      role,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Rol actualizado correctamente",
    });
  } catch (error: any) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar rol" },
      { status: 500 }
    );
  }
}

// Actualizar usuario
export async function PATCH(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    // Actualizar en Firebase Auth si es necesario
    const authUpdates: any = {};
    if (updates.displayName) authUpdates.displayName = updates.displayName;
    if (updates.email) authUpdates.email = updates.email;
    if (updates.disabled !== undefined) authUpdates.disabled = updates.disabled;

    if (Object.keys(authUpdates).length > 0) {
      await auth.updateUser(userId, authUpdates);
    }

    // Actualizar custom claims si cambia el rol
    if (updates.role) {
      await auth.setCustomUserClaims(userId, { role: updates.role });
    }

    // Actualizar en Firestore
    await db
      .collection("users")
      .doc(userId)
      .update({
        ...updates,
        updatedAt: new Date(),
      });

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado correctamente",
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
