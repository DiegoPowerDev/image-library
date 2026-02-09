// store/campañasStore.ts
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

// ✅ Actualizado: Historial para segmentaciones con soporte para imágenes

interface Historial {
  id: number;
  titulo: string;
  descripcion: string;
  autor: string;
  fechaModificacion: Date;
  cambios: {
    campo: string;
    anterior?: string;
    nuevo?: string;
    tipo?: string;
    imagenes?: number[];
  }[];
}

interface Volantes {
  id: number;
  nombre: string;
  imagenes: number[];
  autor: string;
  fechaModificacion: Date;
  fechaCreacion: Date;
  campaña: string;
  descripcion: string;
  historial: Historial[];
}

interface CounterState {
  isLoadingFromFirestore: boolean;
  volantes: Volantes[];
  lastId: number;
  loadVolanteData: () => Unsubscribe;
  saveToFirestore: () => Promise<void>;

  addVolante: (
    nombre: string,
    descripcion: string,
    imagenes: number[],
    autor: string,
    campaña: string
  ) => void;

  deleteVolante: (volanteID: number) => void;

  updateVolante: (
    volanteID: number,
    data: Partial<Volantes>,
    imagenesAgregadas: number[],
    imagenesEliminadas: number[],
    autor: string | null
  ) => void;
}

export const useVolanteStore = create<CounterState>((set, get) => ({
  isLoadingFromFirestore: true,
  lastId: 0,
  volantes: [],

  deleteVolante: (volanteID: number) => {
    set((state) => ({
      volantes: state.volantes.filter((c) => c.id !== volanteID),
    }));
    get().saveToFirestore();
  },
  addVolante: (nombre, descripcion, imagenes, autor, campaña) => {
    const state = get();
    const now = new Date();

    const cambios: {
      campo: string;
      anterior?: string;
      nuevo?: string;
      tipo?: string;
      imagenes?: number[];
    }[] = [];

    const cambiosTexto: string[] = [];

    // Agregar información de título y descripción
    cambiosTexto.push(`Título: "${nombre}"`);
    if (descripcion) {
      cambiosTexto.push(`Descripción: "${descripcion}"`);
    }
    cambiosTexto.push(`Campaña: ${campaña}`);
    // Si hay imágenes, agregarlas a los cambios
    if (imagenes.length > 0) {
      cambios.push({
        campo: "Imágenes",
        tipo: "agregadas",
        imagenes: imagenes,
      });
      cambiosTexto.push(`${imagenes.length} imagen(es) agregada(s)`);
    }

    const nuevoVolante: Volantes = {
      id: state.lastId,
      nombre,
      descripcion,
      imagenes: imagenes,
      fechaCreacion: now,
      fechaModificacion: now,
      autor,
      campaña,
      historial: [
        {
          id: 1,
          titulo: "Tarea creada",
          descripcion: cambiosTexto.join(", "),
          autor: autor || "autor",
          fechaModificacion: now,
          cambios: cambios,
        },
      ],
    };

    set((state) => ({
      volantes: [...state.volantes, nuevoVolante],
      lastId: state.lastId + 1,
    }));

    get().saveToFirestore();
  },

  updateVolante: (
    tareaId: number,
    data: Partial<Volantes>,
    imagenesAgregadas: number[],
    imagenesEliminadas: number[],
    autor: string | null
  ) => {
    const state = get();
    const tarea = state.volantes.find((t) => t.id === tareaId);
    if (!tarea) return;

    const cambios: {
      campo: string;
      anterior?: string;
      nuevo?: string;
      tipo?: string;
      imagenes?: number[];
    }[] = [];
    const cambiosTexto: string[] = [];

    // Comparar título
    if (data.nombre !== undefined && data.nombre !== tarea.nombre) {
      cambios.push({
        campo: "Título",
        anterior: tarea.nombre,
        nuevo: data.nombre,
      });
      cambiosTexto.push(`Título actualizado`);
    }

    // Comparar descripción
    if (
      data.descripcion !== undefined &&
      data.descripcion !== tarea.descripcion
    ) {
      cambios.push({
        campo: "Descripción",
        anterior: tarea.descripcion,
        nuevo: data.descripcion,
      });
      cambiosTexto.push(`Descripción actualizada`);
    }
    if (data.campaña !== undefined && data.campaña !== tarea.campaña) {
      cambios.push({
        campo: "Campaña",
        anterior: tarea.campaña,
        nuevo: data.campaña,
      });
      cambiosTexto.push(`Campaña actualizada`);
    }

    // Agregar cambios de imágenes agregadas
    if (imagenesAgregadas.length > 0) {
      cambios.push({
        campo: "Imágenes",
        tipo: "agregadas",
        imagenes: imagenesAgregadas,
      });
      cambiosTexto.push(`${imagenesAgregadas.length} imagen(es) agregada(s)`);
    }

    // Agregar cambios de imágenes eliminadas
    if (imagenesEliminadas.length > 0) {
      cambios.push({
        campo: "Imágenes",
        tipo: "eliminadas",
        imagenes: imagenesEliminadas,
      });
      cambiosTexto.push(`${imagenesEliminadas.length} imagen(es) eliminada(s)`);
    }

    if (cambios.length === 0) {
      console.log("ℹ️ No hay cambios para guardar");
      return;
    }

    // Calcular nuevas imágenes
    const nuevasImagenes = [
      ...tarea.imagenes.filter((id) => !imagenesEliminadas.includes(id)),
      ...imagenesAgregadas,
    ];

    const nuevoHistorial: Historial = {
      id: tarea.historial.length + 1,
      titulo: "Edición realizada",
      descripcion: cambiosTexto.join(", "),
      autor: autor || "autor",
      fechaModificacion: new Date(),
      cambios,
    };

    const updateVolantes = state.volantes.map((t) => {
      if (t.id === tareaId) {
        return {
          ...t,
          ...data,
          imagenes: nuevasImagenes,
          fechaModificacion: new Date(),
          historial: [...t.historial, nuevoHistorial],
        };
      }
      return t;
    });

    set({ volantes: updateVolantes });
    get().saveToFirestore();

    console.log("✅ Tarea actualizada con historial:", cambios);
  },

  loadVolanteData: () => {
    const userDoc = doc(db, "database", "volantes");

    const unsubscribe = onSnapshot(
      userDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          const firestoreData = snapshot.data();

          const volantesConFechas = (firestoreData.volantes || []).map(
            (volantes: any) => ({
              ...volantes,
              fechaModificacion:
                volantes.fechaModificacion?.toDate?.() ||
                new Date(volantes.fechaModificacion),
              fechaCreacion:
                volantes.fechaCreacion?.toDate?.() ||
                new Date(volantes.fechaCreacion),
              historial: (volantes.historial || []).map((h: any) => ({
                ...h,
                fechaModificacion:
                  h.fechaModificacion?.toDate?.() ||
                  new Date(h.fechaModificacion),
              })),
            })
          );

          const itemsSorted = [...volantesConFechas].sort(
            (a: Volantes, b: Volantes) => b.id - a.id
          );

          set({
            isLoadingFromFirestore: false,
            volantes: itemsSorted,
            lastId: firestoreData.lastId || 0,
          });

          console.log("✅ Volantes cargados desde Firestore");
        } else {
          console.warn("⚠️ Store de volantes no encontrado");
          set({
            volantes: [],
            isLoadingFromFirestore: false,
            lastId: 0,
          });
        }
      },
      (error) => {
        console.error("❌ Error en onSnapshot campañas:", error);
        set({
          isLoadingFromFirestore: false,
        });
      }
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
      volantes: state.volantes,
      lastId: state.lastId,
    };

    try {
      await updateDoc(doc(db, "database", "volantes"), data);
      console.log("💾 Volantes guardadas en Firestore");
    } catch (err: any) {
      console.error("❌ Error guardando volantes:", err);
      if (err.code === "not-found") {
        try {
          await setDoc(doc(db, "database", "volantes"), data);
          console.log("📝 Documento de volantes creado");
        } catch (setErr) {
          console.error("❌ Error al crear documento:", setErr);
        }
      }
    }
  },
}));
