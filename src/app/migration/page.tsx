"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { doc, setDoc, getDoc, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app from "@/firebase/config";
import toast from "react-hot-toast";

const db = getFirestore(app);
const auth = getAuth(app);

export default function MigrationPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  const migrateCurrentUser = async () => {
    setLoading(true);
    setStatus("Verificando usuario...");

    try {
      const user = auth.currentUser;

      if (!user) {
        toast.error("No hay usuario autenticado");
        setStatus("Error: No hay usuario autenticado");
        return;
      }

      setStatus(`Usuario encontrado: ${user.email}`);

      // Verificar si ya existe el documento
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setStatus(
          `El documento ya existe. Rol: ${data.role}, Estado: ${data.status}`
        );
        toast.success("El documento ya existe");
        return;
      }

      setStatus("Creando documento en Firestore...");

      // Crear documento
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "Usuario",
        role: "admin", // Primer usuario es admin por defecto
        status: "active",
        createdAt: new Date(user.metadata.creationTime!),
        lastLogin: new Date(user.metadata.lastSignInTime!),
      });

      setStatus("✅ Documento creado exitosamente");
      toast.success("Usuario migrado correctamente");
    } catch (error: any) {
      console.error("Error:", error);
      setStatus(`❌ Error: ${error.message}`);
      toast.error("Error al migrar usuario");
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    setLoading(true);
    setStatus("Verificando...");

    try {
      const user = auth.currentUser;

      if (!user) {
        setStatus("❌ No hay usuario autenticado");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setStatus(`
✅ Documento encontrado:
- Email: ${data.email}
- Nombre: ${data.displayName}
- Rol: ${data.role}
- Estado: ${data.status}
- Creado: ${data.createdAt?.toDate?.().toLocaleString() || "N/A"}
        `);
      } else {
        setStatus("❌ No existe documento en Firestore para este usuario");
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <div>
            <div>Migración de Usuarios</div>
            <span>
              Utilidad para crear documentos de Firestore para usuarios
              existentes en Firebase Auth
            </span>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Usuario actual:{" "}
                <strong>{auth.currentUser?.email || "No autenticado"}</strong>
              </p>
              <p className="text-sm text-gray-400">
                UID: <strong>{auth.currentUser?.uid || "N/A"}</strong>
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={checkCurrentUser}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                Verificar Estado
              </Button>
              <Button
                onClick={migrateCurrentUser}
                disabled={loading || !auth.currentUser}
                className="flex-1"
              >
                {loading ? "Procesando..." : "Migrar Usuario"}
              </Button>
            </div>

            {status && (
              <div className="bg-gray-900 p-4 rounded-md">
                <pre className="text-sm whitespace-pre-wrap">{status}</pre>
              </div>
            )}

            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-md">
              <p className="text-sm text-blue-300">
                <strong>Instrucciones:</strong>
              </p>
              <ol className="text-sm text-blue-200 mt-2 space-y-1 list-decimal list-inside">
                <li>Inicia sesión con tu cuenta</li>
                <li>
                  Haz clic en "Verificar Estado" para ver si ya existe el
                  documento
                </li>
                <li>Si no existe, haz clic en "Migrar Usuario"</li>
                <li>El documento se creará con rol "admin" por defecto</li>
              </ol>
            </div>
          </div>
        </div>

        <div>
          <div>
            <div>Información</div>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            <p>
              Esta página crea documentos en la colección{" "}
              <code className="bg-gray-800 px-1 rounded">users/{`{uid}`}</code>
            </p>
            <p>Estructura del documento:</p>
            <pre className="bg-gray-900 p-3 rounded-md overflow-x-auto">
              {`{
  email: string,
  displayName: string,
  role: "admin" | "editor" | "viewer",
  status: "active" | "disabled",
  createdAt: Timestamp,
  lastLogin: Timestamp | null
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
