import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 },
      );
    }

    const userRecord = await adminAuth.getUser(userId);
    const newDisabledState = !userRecord.disabled;
    const newStatus = newDisabledState ? "inactive" : "active";
    await adminAuth.updateUser(userId, {
      disabled: newDisabledState,
    });

    return NextResponse.json({
      success: true,
      message: `Usuario ${newStatus === "active" ? "habilitado" : "inhabilitado"} correctamente`,
      newStatus: newStatus,
    });
  } catch (error: any) {
    console.error("❌ Error updating user status:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar usuario" },
      { status: 500 },
    );
  }
}
