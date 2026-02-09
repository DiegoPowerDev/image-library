import { create } from "zustand";
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  getFirestore,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import app from "@/firebase/config";
import { getAuth } from "firebase/auth";

const db = getFirestore(app);

interface User {
  id: string;
  email: string;
  displayName: string;
  area: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "disabled";
  createdAt: Date;
  lastLogin?: Date;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  loadUsers: () => void;
  updateUser: (
    userId: string,
    newRole: "admin" | "editor" | "viewer",
    nombre: string | null,
  ) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  currentUser: null,
  loading: true,

  loadUsers: () => {
    const uid = getAuth().currentUser?.uid;
    const usersQuery = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersData: User[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            id: doc.id,
            email: data.email,
            area: data.area || "ninguna",
            displayName: data.displayName || data.email,
            role: data.role || "viewer",
            status: data.status || "active",
            createdAt: data.createdAt?.toDate() || new Date(),
            lastLogin: data.lastLogin?.toDate(),
          });
        });
        set({
          users: usersData,
          loading: false,
          currentUser: usersData.find((u) => u.id === uid),
        });
      },
      (error) => {
        console.error("❌ Error cargando usuarios:", error);
        set({ loading: false });
      },
    );

    return unsubscribe;
  },

  updateUser: async (
    userId: string,
    newRole: "admin" | "editor" | "viewer",
    nombre: string | null,
  ) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date(),
        displayName: nombre,
      });

      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      }));

      console.log(`✅ Rol actualizado para usuario ${userId}: ${newRole}`);
    } catch (error) {
      console.error("❌ Error actualizando rol:", error);
      throw error;
    }
  },

  toggleUserStatus: async (userId: string) => {
    try {
      const user = get().users.find((u) => u.id === userId);
      if (!user) throw new Error("Usuario no encontrado");

      const newStatus = user.status === "active" ? "disabled" : "active";
      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Actualizar estado local
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, status: newStatus } : u,
        ),
      }));

      console.log(`✅ Estado actualizado para usuario ${userId}: ${newStatus}`);
    } catch (error) {
      console.error("❌ Error cambiando estado:", error);
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      // Verificar que no sea el usuario actual
      const currentUser = get().currentUser;
      if (currentUser?.id === userId) {
        throw new Error("No puedes eliminar tu propia cuenta");
      }

      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);

      // Actualizar estado local
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
      }));

      console.log(`✅ Usuario ${userId} eliminado`);
    } catch (error) {
      console.error("❌ Error eliminando usuario:", error);
      throw error;
    }
  },
}));
