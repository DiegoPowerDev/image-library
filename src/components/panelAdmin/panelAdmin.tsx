"use client";
import { useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import {
  IconDownload,
  IconUpload,
  IconDatabase,
  IconUsers,
  IconAlertTriangle,
  IconFileExport,
  IconFileImport,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import UserAdminPanel from "./userAdminPanel";

const db = getFirestore();

interface BackupData {
  version: string;
  timestamp: string;
  database: Record<string, any>;
  users: any[];
}

export default function PanelAdmin() {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("users");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [backupStats, setBackupStats] = useState<{
    collections: string[];
    totalDocs: number;
    users: number;
  } | null>(null);

  // Exportar backup completo (toda la colección database + usuarios)
  const exportarBackupCompleto = async () => {
    setLoading(true);
    try {
      // Obtener todos los documentos de la colección 'database'
      const databaseSnapshot = await getDocs(collection(db, "database"));
      const databaseData: Record<string, any> = {};

      databaseSnapshot.docs.forEach((doc) => {
        databaseData[doc.id] = doc.data();
      });

      // Obtener todos los usuarios y convertir Timestamps a ISO strings
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          status: data.status,
          createdAt:
            data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          lastLogin:
            data.lastLogin?.toDate?.()?.toISOString() || data.lastLogin,
          updatedAt:
            data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        };
      });

      // Crear estructura de backup
      const backupCompleto: BackupData = {
        version: "2.0",
        timestamp: new Date().toISOString(),
        database: databaseData,
        users: usersData,
      };

      // Descargar archivo
      const blob = new Blob([JSON.stringify(backupCompleto, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fecha = new Date().toISOString().split("T")[0];
      const hora = new Date()
        .toISOString()
        .split("T")[1]
        .split(".")[0]
        .replace(/:/g, "-");
      link.download = `backup_completo_${fecha}_${hora}.json`;
      link.click();
      URL.revokeObjectURL(url);

      const collectionNames = Object.keys(databaseData);
      toast.success(
        `Backup creado: ${
          collectionNames.length
        } colecciones (${collectionNames.join(", ")}) y ${
          usersData.length
        } usuarios`
      );
    } catch (error) {
      console.error("Error en backup:", error);
      toast.error("Error al crear backup");
    } finally {
      setLoading(false);
    }
  };

  // Preparar importación
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        if (!json.version || !json.database) {
          toast.error("Formato de backup inválido");
          return;
        }

        const collections = Object.keys(json.database);
        const totalDocs = collections.reduce((acc, key) => {
          const data = json.database[key];
          if (data.items && Array.isArray(data.items)) {
            return acc + data.items.length;
          }
          if (data.tareas && Array.isArray(data.tareas)) {
            return acc + data.tareas.length;
          }
          return acc + 1;
        }, 0);

        setBackupStats({
          collections,
          totalDocs,
          users: json.users?.length || 0,
        });

        setImportFile(file);
        setShowImportDialog(true);
      } catch (error) {
        toast.error("Archivo JSON inválido");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  // Importar backup completo
  const importarBackup = async () => {
    if (!importFile) return;

    setLoading(true);
    setShowImportDialog(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json: BackupData = JSON.parse(e.target?.result as string);

        if (!json.version || !json.database) {
          throw new Error("Formato de backup inválido");
        }

        // Restaurar toda la colección 'database'
        for (const [docId, docData] of Object.entries(json.database)) {
          await setDoc(doc(db, "database", docId), docData);
        }

        // Restaurar usuarios (convertir fechas string a Timestamp)
        if (json.users && Array.isArray(json.users)) {
          for (const user of json.users) {
            const { id, createdAt, lastLogin, updatedAt, ...userData } = user;

            await setDoc(doc(db, "users", id), {
              ...userData,
              createdAt: createdAt
                ? Timestamp.fromDate(new Date(createdAt))
                : null,
              lastLogin: lastLogin
                ? Timestamp.fromDate(new Date(lastLogin))
                : null,
              updatedAt: updatedAt
                ? Timestamp.fromDate(new Date(updatedAt))
                : null,
            });
          }
        }

        const collections = Object.keys(json.database);
        toast.success(
          `Backup importado: ${
            collections.length
          } colecciones (${collections.join(", ")}) y ${
            json.users?.length || 0
          } usuarios`
        );
      } catch (error) {
        console.error("Error al importar:", error);
        toast.error("Error al importar backup");
      } finally {
        setLoading(false);
        setImportFile(null);
        setBackupStats(null);
      }
    };
    reader.readAsText(importFile);
  };
  return (
    <div className="w-full h-full p-6 space-y-6 flex flex-col bg-black text-white 2xl:px-40">
      <div className="grid w-full grid-cols-2 max-w-md gap-4">
        <Button
          variant="ghost"
          onClick={() => setTab("users")}
          className={cn(
            tab === "users" && "bg-white text-black",
            "gap-2 border border-white"
          )}
        >
          <IconUsers size={18} />
          Usuarios
        </Button>
        <Button
          variant="ghost"
          onClick={() => setTab("backup")}
          value="backup"
          className={cn(
            tab === "backup" && "bg-white text-black",
            "gap-2 border border-white"
          )}
        >
          <IconDatabase size={18} />
          Backups
        </Button>
      </div>

      {tab === "users" ? (
        <UserAdminPanel />
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-gray-400 mt-1">
              Gestión completa de copias de seguridad
            </p>
          </div>

          <div className="w-full">
            <div className="flex flex-col gap-8 pt-8">
              {/* Exportar backup */}
              <div className="flex flex-col border border-white/20 p-6 rounded-xl gap-4">
                <div className="flex items-center gap-3 text-xl font-semibold">
                  <IconFileExport size={28} />
                  Exportar Base de Datos Completa
                </div>

                <div className="text-sm text-gray-400">
                  Incluye todas las colecciones (imágenes, tareas, etc.) y
                  usuarios
                </div>

                <Button
                  onClick={exportarBackupCompleto}
                  disabled={loading}
                  variant="ghost"
                  className="gap-3 h-24 border border-white/40 hover:border-white "
                >
                  <IconDatabase size={40} />
                  <div className="text-center">
                    <div className="font-semibold text-lg">
                      Descargar Backup Completo
                    </div>
                    <div className="text-xs opacity-70">
                      Toda la base de datos + usuarios
                    </div>
                  </div>
                </Button>
              </div>

              {/* Importar backup */}
              <div className="flex flex-col border border-white/20 p-6 rounded-xl gap-4">
                <div className="flex items-center gap-3 text-xl font-semibold">
                  <IconFileImport size={28} />
                  Importar Base de Datos Completa
                </div>

                <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-md flex gap-3">
                  <IconAlertTriangle
                    size={24}
                    className="text-amber-500 shrink-0"
                  />
                  <div className="text-sm text-amber-200">
                    <strong>Advertencia:</strong> Importar un backup
                    sobrescribirá <strong>TODOS</strong> los datos actuales de
                    todas las colecciones. Esta acción no se puede deshacer.
                    Asegúrate de tener un backup reciente antes de proceder.
                  </div>
                </div>

                <label className="cursor-pointer">
                  <Button
                    asChild
                    disabled={loading}
                    className="gap-3 w-full h-16 border border-white/40"
                    size="lg"
                    variant="ghost"
                  >
                    <div>
                      <IconUpload size={24} />
                      Seleccionar archivo de backup (.json)
                    </div>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Dialog de confirmación de importación */}
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  ¿Confirmar importación?
                </DialogTitle>
                <DialogDescription />
              </DialogHeader>

              <div className="space-y-4">
                <div className="text-sm">
                  Esta acción sobrescribirá <strong>TODOS</strong> los datos
                  actuales con el contenido del backup:
                </div>

                {backupStats && (
                  <div className="bg-zinc-800 p-4 rounded-md space-y-2">
                    <div className="font-semibold">Contenido del backup:</div>
                    <div className="space-y-1 text-sm">
                      <div>
                        • {backupStats.collections.length} colecciones:{" "}
                        {backupStats.collections.join(", ")}
                      </div>
                      <div>• {backupStats.totalDocs} documentos totales</div>
                      {backupStats.users > 0 && (
                        <div>• {backupStats.users} usuarios</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-red-400 font-semibold bg-red-900/20 p-3 rounded border border-red-500/30">
                  ⚠️ Esta acción no se puede deshacer
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <DialogClose asChild>
                  <Button variant="ghost" className="border">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  onClick={importarBackup}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirmar importación
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
