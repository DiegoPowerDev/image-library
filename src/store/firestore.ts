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

interface FormData {
  nombre: string;
  imagen: string;
  url: string;
  descripcion: string;
  autor: string;
  categoria: string;
  campaña: string;
}

interface EditFormData {
  id: number;
  nombre?: string;
  url?: string;
  descripcion?: string;
  categoria?: string;
  campaña?: string;
  autor: string;
}

interface Historial {
  id: number;
  titulo: string;
  descripcion: string;
  url: string;
  autor: string;
  fechaModificacion: Date;
}

interface Image {
  id: number;
  nombre: string;
  url: string;
  autor: string;
  fechaModificacion: Date;
  fechaCreacion: Date;
  categoria: string;
  estado: string;
  campaña: string;
  descripcion: string;
  historial: Historial[];
}

interface CounterState {
  uid: string | null;
  email: string | null;
  setEmail: (email: string | null) => void;
  setUid: (uid: string | null) => void;
  autenticado: boolean;
  setAutenticado: (autenticado: boolean) => void;
  biblioteca: any[];
  setBiblioteca: (biblioteca: any) => void;
  lastId: number;
  items: Image[];
  addImagen: (form: FormData) => Promise<void>;
  editImagen: (form: EditFormData) => Promise<void>;
  mode: string;
  setMode: (mode: string) => void;
  sideOption: string;
  setSideOption: (sideOption: string) => void;
  menu: boolean;
  loading: boolean;
  isLoadingFromFirestore: boolean;
  saveToFirestore: () => Promise<void>;
  setMenu: () => void;
  loadUserData: () => Unsubscribe | void;
  deleteImagen: (id: number) => Promise<void>;
  restoreImagen: (id: number) => Promise<void>;
  destroyImagen: (id: number) => Promise<void>;
}

export const useFireStore = create<CounterState>((set, get) => ({
  email: null,
  setEmail: (email: string | null) => set({ email }),
  autenticado: false,
  setAutenticado: (autenticado: boolean) => set({ autenticado }),
  biblioteca: [],
  setBiblioteca: (biblioteca: any) => set({ biblioteca }),
  loading: true,
  lastId: 0,
  uid: null,
  setUid: (uid: string | null) => set({ uid }),
  items: [],
  mode: "tools",
  sideOption: "Biblioteca",
  menu: true,
  isLoadingFromFirestore: true,

  loadUserData: () => {
    set({ loading: true });
    const userDoc = doc(db, "database", "images");

    const unsubscribe = onSnapshot(
      userDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          const firestoreData = snapshot.data();
          const itemsWithDates = (firestoreData.items || []).map(
            (item: any) => ({
              ...item,
              fechaModificacion:
                item.fechaModificacion?.toDate?.() ||
                new Date(item.fechaModificacion),
              fechaCreacion:
                item.fechaCreacion?.toDate?.() || new Date(item.fechaCreacion),
              historial: (item.historial || []).map((h: any) => ({
                ...h,
                fechaModificacion:
                  h.fechaModificacion?.toDate?.() ||
                  new Date(h.fechaModificacion),
              })),
            }),
          );

          const itemsSorted = [...itemsWithDates].sort(
            (a: Image, b: Image) => b.id - a.id,
          );

          set({
            items: itemsSorted,
            isLoadingFromFirestore: false,
            loading: false,
            lastId: firestoreData.lastId || 0,
          });

          console.log("✅ Datos cargados desde Firestore");
        } else {
          console.warn("⚠️ Store no encontrado, inicializando...");
          set({
            items: [],
            isLoadingFromFirestore: false,
            loading: false,
            lastId: 0,
          });
        }
      },
      (error) => {
        console.error("❌ Error en onSnapshot:", error);
        set({
          isLoadingFromFirestore: false,
          loading: false,
        });
      },
    );

    return unsubscribe;
  },

  saveToFirestore: async () => {
    const state = get();

    // 🔴 PROTECCIÓN: No guardar si aún estamos cargando desde Firestore
    if (state.isLoadingFromFirestore) {
      console.log("⏸️ Guardado pausado: cargando desde Firestore");
      return;
    }

    const data = {
      items: state.items,
      lastId: state.lastId,
    };

    try {
      await updateDoc(doc(db, "database", "images"), data);
      console.log("💾 Datos guardados en Firestore");
    } catch (err: any) {
      console.error("❌ Error guardando:", err);
      if (err.code === "not-found") {
        try {
          await setDoc(doc(db, "database", "images"), data);
          console.log("📝 Documento creado después de error not-found");
        } catch (setErr) {
          console.error("❌ Error al crear documento:", setErr);
        }
      }
    }
  },

  addImagen: async (data: FormData) => {
    const state = get();
    const newId = state.lastId + 1;

    const newImagen: Image = {
      ...data,
      id: newId,
      fechaModificacion: new Date(),
      fechaCreacion: new Date(),
      estado: "activo",
      historial: [
        {
          id: 1,
          titulo: "Imagen creada",
          descripcion: `La imagen fue creada en el sistema. Título: ${data.nombre}, Descripción: ${data.descripcion}`,
          url: data.url,
          autor: data.autor,
          fechaModificacion: new Date(),
        },
      ],
    };

    console.log("Agregando imagen:", newImagen);

    set({
      items: [...state.items, newImagen],
      lastId: newId,
    });

    // Guardar después de actualizar el estado
    await get().saveToFirestore();
  },

  editImagen: async (data: EditFormData) => {
    const state = get();
    const imagenIndex = state.items.findIndex((img) => img.id === data.id);

    if (imagenIndex === -1) {
      console.error("❌ Imagen no encontrada");
      return;
    }

    const imagenActual = state.items[imagenIndex];
    const cambios: string[] = [];
    const cambiosDetallados: {
      campo: string;
      anterior: string;
      nuevo: string;
    }[] = [];

    if (data.nombre && data.nombre !== imagenActual.nombre) {
      cambios.push(
        `Título cambiado: Anterior: "${imagenActual.nombre}" Nuevo: "${data.nombre}"`,
      );
      cambiosDetallados.push({
        campo: "nombre",
        anterior: imagenActual.nombre,
        nuevo: data.nombre,
      });
    }

    if (data.descripcion && data.descripcion !== imagenActual.descripcion) {
      cambios.push(
        `Descripción cambiada: Anterior: "${imagenActual.descripcion}" Nuevo: "${data.descripcion}"`,
      );
      cambiosDetallados.push({
        campo: "descripcion",
        anterior: imagenActual.descripcion,
        nuevo: data.descripcion,
      });
    }

    if (data.categoria && data.categoria !== imagenActual.categoria) {
      cambios.push(
        `Categoría cambiada: Anterior: "${imagenActual.categoria}" Nuevo: "${data.categoria}"`,
      );
      cambiosDetallados.push({
        campo: "categoria",
        anterior: imagenActual.categoria,
        nuevo: data.categoria,
      });
    }

    if (data.campaña && data.campaña !== imagenActual.campaña) {
      cambios.push(
        `Campaña cambiada: Anterior: "${imagenActual.campaña}" Nuevo: "${data.campaña}"`,
      );
      cambiosDetallados.push({
        campo: "campaña",
        anterior: imagenActual.campaña,
        nuevo: data.campaña,
      });
    }

    if (data.url && data.url !== imagenActual.url) {
      cambios.push(
        `Imagen reemplazada:\n Anterior: ${imagenActual.url}\n Nuevo: ${data.url}`,
      );
      cambiosDetallados.push({
        campo: "url",
        anterior: imagenActual.url,
        nuevo: data.url,
      });
    }

    // Si no hay cambios, no hacer nada
    if (cambios.length === 0) {
      console.log("ℹ️ No hay cambios para guardar");
      return;
    }

    // Crear nuevo registro en el historial
    const nuevoHistorial: Historial = {
      id: imagenActual.historial.length + 1,
      titulo: `Edición realizada`,
      descripcion: `${cambios.join(",\n ")}`,
      url: data.url || "",
      autor: data.autor,
      fechaModificacion: new Date(),
    };

    // Crear imagen actualizada
    const imagenActualizada: Image = {
      ...imagenActual,
      nombre: data.nombre || imagenActual.nombre,
      descripcion: data.descripcion || imagenActual.descripcion,
      categoria: data.categoria || imagenActual.categoria,
      campaña: data.campaña || imagenActual.campaña,
      url: data.url || imagenActual.url,
      fechaModificacion: new Date(),
      historial: [...imagenActual.historial, nuevoHistorial],
    };

    // Actualizar el array de items
    const nuevosItems = [...state.items];
    nuevosItems[imagenIndex] = imagenActualizada;

    console.log("✏️ Editando imagen:", imagenActualizada);
    console.log("📝 Cambios realizados:", cambiosDetallados);

    set({ items: nuevosItems });

    // Guardar en Firestore
    await get().saveToFirestore();
  },

  deleteImagen: async (id: number) => {
    const state = get();

    const imagenIndex = state.items.findIndex((img) => img.id === id);

    const imagenActual = state.items[imagenIndex];

    const nuevoHistorial: Historial = {
      id: imagenActual.historial.length + 1,
      titulo: `Se eliminó imagen`,
      descripcion: `Se eliminó imagen`,
      url: "",
      autor: state.email || "autor",
      fechaModificacion: new Date(),
    };

    const nuevosItems = state.items.map((img) =>
      img.id === id
        ? {
            ...img,
            estado: "eliminado",
            historial: [...img.historial, nuevoHistorial],
          }
        : img,
    );

    set({ items: nuevosItems });
    await get().saveToFirestore();
  },
  restoreImagen: async (id: number) => {
    const state = get();

    const imagenIndex = state.items.findIndex((img) => img.id === id);

    const imagenActual = state.items[imagenIndex];

    const nuevoHistorial: Historial = {
      id: imagenActual.historial.length + 1,
      titulo: `Se restauró imagen`,
      descripcion: `Se restauró imagen`,
      url: "",
      autor: state.email || "autor",
      fechaModificacion: new Date(),
    };
    const nuevosItems = state.items.map((img) =>
      img.id === id
        ? {
            ...img,
            estado: "activo",
            historial: [...img.historial, nuevoHistorial],
          }
        : img,
    );
    set({ items: nuevosItems });
    await get().saveToFirestore();
  },
  destroyImagen: async (id: number) => {
    const state = get();
    const nuevosItems = state.items.filter((img) => img.id !== id);
    set({ items: nuevosItems });
    await fetch("/api/deleteImages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    await get().saveToFirestore();
  },

  setMode: (mode: string) => set({ mode }),
  setSideOption: (sideOption: string) => set({ sideOption }),
  setMenu: () => set((s) => ({ menu: !s.menu })),
}));
