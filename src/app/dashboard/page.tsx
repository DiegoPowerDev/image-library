"use client";
import Calendario from "@/components/calendario/calendario";
import Sidebar from "@/components/sidebar/sidebar";
import Table from "@/components/table";
import { useFireStore } from "@/store/firestore";
import { useUserStore } from "@/store/userStore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import PanelAdmin from "@/components/panelAdmin/panelAdmin";
import Dashboard from "@/components/dashboard/dashboard";

export default function Page() {
  const loadUserData = useFireStore((s) => s.loadUserData);
  const loadUsers = useUserStore((s) => s.loadUsers);
  const sideOption = useFireStore((s) => s.sideOption);
  const setEmail = useFireStore((s) => s.setEmail);
  const menu = useFireStore((s) => s.menu);
  const uid = useFireStore((s) => s.uid);
  const setUid = useFireStore((s) => s.setUid);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // loadUserData puede retornar void o Unsubscribe
        setUid(auth.currentUser?.uid || null);
        setEmail(auth.currentUser?.email || null);
        loadUsers();
        const unsubFirestore = loadUserData();

        // Solo asignar si es una función válida
        if (typeof unsubFirestore === "function") {
          window.__UNSUB_FIRESTORE__ = unsubFirestore;
        }
      } else {
        console.log("No hay usuario autenticado");

        // Limpiar el unsubscribe si existe
        if (window.__UNSUB_FIRESTORE__) {
          window.__UNSUB_FIRESTORE__();
          delete window.__UNSUB_FIRESTORE__;
        }

        router.push("/");
      }
    });

    // Cleanup al desmontar el componente
    return () => {
      unsubscribe();

      if (window.__UNSUB_FIRESTORE__) {
        window.__UNSUB_FIRESTORE__();
        delete window.__UNSUB_FIRESTORE__;
      }
    };
  }, [router, loadUserData, setUid]);

  const tables: Record<string, React.ReactElement> = {
    inicio: <Dashboard />,
    Calendario: <Calendario />,
    Panel: <PanelAdmin />,
  };

  return (
    <>
      {uid && (
        <div className="h-full w-full">
          <Sidebar />
          <div
            className={cn(
              menu ? "pl-52" : "pl-16",
              "h-full w-full flex flex-col",
            )}
          >
            {tables[sideOption] ?? <Table />}
          </div>
        </div>
      )}

      <Toaster />
    </>
  );
}
