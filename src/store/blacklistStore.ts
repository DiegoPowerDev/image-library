import app from "@/firebase/config";
import {
  doc,
  getFirestore,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { create } from "zustand";

const db = getFirestore(app);

interface BlacklistUser {
  email: string;
  estado: "propuesto" | "aceptado";
}

interface BlacklistStore {
  blacklistUsers: BlacklistUser[];
  addToBlacklist: (email: string) => void;
  loadBlacklistData: () => Unsubscribe;
  saveToFirestore: () => Promise<void>;
  isLoadingFromFirestore: boolean;
  toggleUserStatus: (email: string) => Promise<void>;
}

export const useBlacklistStore = create<BlacklistStore>((set, get) => ({
  blacklistUsers: [],
  addToBlacklist: (email: string) => {
    set((state) => ({
      blacklistUsers: [...state.blacklistUsers, { email, estado: "propuesto" }],
    }));
  },
  isLoadingFromFirestore: false,
  toggleUserStatus: async (email: string) => {
    try {
      const user = get().blacklistUsers.find((u) => u.email === email);
      if (!user) throw new Error("Usuario no encontrado");

      const newStatus = user.estado === "propuesto" ? "aceptado" : "propuesto";
      const userRef = doc(db, "blacklist", email);

      await updateDoc(userRef, {
        estado: newStatus,
      });

      set((state) => ({
        blacklistUsers: state.blacklistUsers.map((u) =>
          u.email === email ? { ...u, estado: newStatus } : u,
        ),
      }));

      console.log(`✅ Estado actualizado para usuario ${email}: ${newStatus}`);
    } catch (error) {
      console.error("❌ Error cambiando estado:", error);
      throw error;
    }
  },
  loadBlacklistData: () => {
    const userDoc = doc(db, "database", "blacklist");
    set({ isLoadingFromFirestore: true });
    const unsubscribe = onSnapshot(
      userDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          const firestoreData = snapshot.data();

          set({
            blacklistUsers: firestoreData.blacklistUsers || [],
            isLoadingFromFirestore: false,
          });

          console.log("✅ Blacklist cargada desde Firestore");
        } else {
          console.warn("⚠️ Store de blacklist no encontrado");
          set({
            blacklistUsers: [],
            isLoadingFromFirestore: false,
          });
        }
      },
      (error) => {
        console.error("❌ Error en onSnapshot blacklist:", error);
        set({
          isLoadingFromFirestore: false,
        });
      },
    );

    return unsubscribe;
  },

  saveToFirestore: async () => {
    const state = get();

    if (state.isLoadingFromFirestore) {
      console.log("⏸️ Guardado pausado: cargando desde Firestore");
      return;
    }

    const data = {
      blacklistUsers: state.blacklistUsers,
    };

    try {
      await updateDoc(doc(db, "database", "blacklist"), data);
      console.log("💾 Blacklist guardada en Firestore");
    } catch (err: any) {
      console.error("❌ Error guardando blacklist:", err);
      if (err.code === "not-found") {
        try {
          await setDoc(doc(db, "database", "blacklist"), data);
          console.log("📝 Documento de blacklist creado");
        } catch (setErr) {
          console.error("❌ Error al crear documento:", setErr);
        }
      }
    }
  },
}));
