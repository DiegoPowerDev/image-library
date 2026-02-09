// store/tareasStore.ts
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

interface HistorialTarea {
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

interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  fecha: Date;
  imagenes: number[];
  historial: HistorialTarea[];
  fechaCreacion: Date;
  fechaModificacion: Date;
}

interface TareasState {
  isLoadingFromFirestore: boolean;
  tareas: Tarea[];
  lastId: number;

  addTarea: (
    fecha: Date,
    titulo: string,
    descripcion: string,
    imagenes: number[],
    autor: string | null,
    estado: string
  ) => void;
  deleteTarea: (tareaId: number) => void;
  updateTarea: (
    tareaId: number,
    data: Partial<Tarea>,
    imagenesAgregadas: number[],
    imagenesEliminadas: number[],
    autor: string | null
  ) => void;

  getTareasByDate: (año: number, mes: number, dia: number) => Tarea[];
  searchTareas: (query: string) => Tarea[];

  loadTareasData: () => Unsubscribe;
  saveToFirestore: () => Promise<void>;
}

export const useTareasStore = create<TareasState>((set, get) => ({
  isLoadingFromFirestore: true,
  lastId: 0,
  tareas: [],

  addTarea: (
    fecha: Date,
    titulo: string,
    descripcion: string,
    imagenes: number[],
    autor: string | null,
    estado: string
  ) => {
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
    cambiosTexto.push(`Título: "${titulo}"`);
    if (descripcion) {
      cambiosTexto.push(`Descripción: "${descripcion}"`);
    }
    cambiosTexto.push(`Estado: "${estado || "Activo"}"`);
    // Si hay imágenes, agregarlas a los cambios
    if (imagenes.length > 0) {
      cambios.push({
        campo: "Imágenes",
        tipo: "agregadas",
        imagenes: imagenes,
      });
      cambiosTexto.push(`${imagenes.length} imagen(es) agregada(s)`);
    }

    const nuevaTarea: Tarea = {
      id: state.lastId,
      titulo,
      descripcion,
      fecha,
      estado,
      imagenes: imagenes,
      fechaCreacion: now,
      fechaModificacion: now,
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
      tareas: [...state.tareas, nuevaTarea],
      lastId: state.lastId + 1,
    }));

    get().saveToFirestore();
  },

  deleteTarea: (tareaId: number) => {
    set((state) => ({
      tareas: state.tareas.filter((t) => t.id !== tareaId),
    }));
    get().saveToFirestore();
  },

  updateTarea: (
    tareaId: number,
    data: Partial<Tarea>,
    imagenesAgregadas: number[],
    imagenesEliminadas: number[],
    autor: string | null
  ) => {
    const state = get();
    const tarea = state.tareas.find((t) => t.id === tareaId);
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
    if (data.titulo !== undefined && data.titulo !== tarea.titulo) {
      cambios.push({
        campo: "Título",
        anterior: tarea.titulo,
        nuevo: data.titulo,
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
        anterior: tarea.descripcion || "activo",
        nuevo: data.descripcion,
      });
      cambiosTexto.push(`Descripción actualizada`);
    }
    // Comparar estado
    if (data.estado !== undefined && data.estado !== tarea.estado) {
      cambios.push({
        campo: "Estado",
        anterior: tarea.estado || "Activo",
        nuevo: data.estado,
      });
      cambiosTexto.push(`Estado actualizado`);
    }

    // Comparar fecha
    if (
      data.fecha !== undefined &&
      data.fecha.getTime() !== tarea.fecha.getTime()
    ) {
      cambios.push({
        campo: "Fecha",
        anterior: new Date(tarea.fecha).toLocaleDateString("es-PE"),
        nuevo: new Date(data.fecha).toLocaleDateString("es-PE"),
      });
      cambiosTexto.push(`Fecha actualizada`);
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

    const nuevoHistorial: HistorialTarea = {
      id: tarea.historial.length + 1,
      titulo: "Edición realizada",
      descripcion: cambiosTexto.join(", "),
      autor: autor || "autor",
      fechaModificacion: new Date(),
      cambios,
    };

    const updatedTareas = state.tareas.map((t) => {
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

    set({ tareas: updatedTareas });
    get().saveToFirestore();

    console.log("✅ Tarea actualizada con historial:", cambios);
  },

  getTareasByDate: (año: number, mes: number, dia: number) => {
    const state = get();
    return state.tareas.filter((tarea) => {
      const fechaTarea = new Date(tarea.fecha);
      return (
        fechaTarea.getFullYear() === año &&
        fechaTarea.getMonth() === mes &&
        fechaTarea.getDate() === dia
      );
    });
  },

  searchTareas: (query: string) => {
    const state = get();
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) return state.tareas;

    return state.tareas.filter((tarea) => {
      return (
        tarea.titulo.toLowerCase().includes(lowerQuery) ||
        tarea.descripcion.toLowerCase().includes(lowerQuery)
      );
    });
  },

  loadTareasData: () => {
    const tareasDoc = doc(db, "database", "tareas");
    const unsubscribe = onSnapshot(
      tareasDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          const firestoreData = snapshot.data();

          const tareasConFechas = (firestoreData.tareas || []).map(
            (tarea: any) => ({
              ...tarea,
              fecha:
                tarea.fecha?.toDate?.() || new Date(tarea.fecha || Date.now()),
              fechaCreacion:
                tarea.fechaCreacion?.toDate?.() ||
                new Date(tarea.fechaCreacion || Date.now()),
              fechaModificacion:
                tarea.fechaModificacion?.toDate?.() ||
                new Date(tarea.fechaModificacion || Date.now()),
              historial: (tarea.historial || []).map((h: any) => ({
                ...h,
                fechaModificacion:
                  h.fechaModificacion?.toDate?.() ||
                  new Date(h.fechaModificacion),
              })),
            })
          );

          set({
            tareas: tareasConFechas,
            isLoadingFromFirestore: false,
            lastId: firestoreData.lastId || 0,
          });

          console.log("✅ Tareas cargadas desde Firestore");
        } else {
          console.warn("⚠️ Store de tareas no encontrado");
          set({
            tareas: [],
            isLoadingFromFirestore: false,
            lastId: 0,
          });
        }
      },
      (error) => {
        console.error("❌ Error en onSnapshot tareas:", error);
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
      tareas: state.tareas,
      lastId: state.lastId,
    };

    try {
      await updateDoc(doc(db, "database", "tareas"), data);
      console.log("💾 Tareas guardadas en Firestore");
    } catch (err: any) {
      console.error("❌ Error guardando tareas:", err);
      if (err.code === "not-found") {
        try {
          await setDoc(doc(db, "database", "tareas"), data);
          console.log("📝 Documento de tareas creado");
        } catch (setErr) {
          console.error("❌ Error al crear documento:", setErr);
        }
      }
    }
  },
}));
