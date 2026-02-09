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
interface HistorialSegmentacion {
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

interface Segmentacion {
  id: number;
  nombre: string;
  imagenes: number[];
  lugares: string;
  edad: string;
  segmentacionDetallada: string;
  inversion: string;
  costoPorVenta: string;
  historial: HistorialSegmentacion[];
  fechaCreacion: Date;
  fechaModificacion: Date;
}

interface Campaña {
  id: number;
  nombre: string;
  segmentacion: Segmentacion[];
}

interface CounterState {
  isLoadingFromFirestore: boolean;
  campañas: Campaña[];
  lastId: number;
  addSegmentaciones: (campañaId: number, nombre: string, autor: string) => void;
  loadCampañasData: () => Unsubscribe;
  saveToFirestore: () => Promise<void>;
  addCampaña: (nombre: string) => void;

  // ✅ Actualizado: ahora requiere autor
  addImagenesToSegmentacion: (
    campañaId: number,
    segmentacionId: number,
    imagenesIds: number[],
    autor: string
  ) => void;
  removeImagenFromSegmentacion: (
    campañaId: number,
    segmentacionId: number,
    imagenesIds: number[],
    autor: string
  ) => void;

  deleteSegmentacion: (campañaId: number, segmentacionId: number) => void;
  deleteCampaña: (campañaId: number) => void;

  updateSegmentacionData: (
    campañaId: number,
    segmentacionId: number,
    data: Partial<Segmentacion>,
    autor: string
  ) => void;
}

export const useCampañaStore = create<CounterState>((set, get) => ({
  isLoadingFromFirestore: true,
  lastId: 0,
  campañas: [],

  addCampaña: (nombre: string) => {
    const lastCampaña = get().lastId;
    set((state) => ({
      campañas: [
        ...state.campañas,
        { id: lastCampaña, nombre, segmentacion: [] },
      ],
      lastId: lastCampaña + 1,
    }));
    get().saveToFirestore();
  },

  deleteCampaña: (campañaId: number) => {
    set((state) => ({
      campañas: state.campañas.filter((c) => c.id !== campañaId),
    }));
    get().saveToFirestore();
  },

  addSegmentaciones: (campañaId: number, nombre: string, autor: string) => {
    const state = get();
    const campañaIndex = state.campañas.findIndex((c) => c.id === campañaId);
    if (campañaIndex === -1) return;

    const newSegmentacionId = state.campañas[campañaIndex].segmentacion.length
      ? state.campañas[campañaIndex].segmentacion[
          state.campañas[campañaIndex].segmentacion.length - 1
        ].id + 1
      : 0;

    const now = new Date();
    const updatedCampañas = [...state.campañas];

    updatedCampañas[campañaIndex].segmentacion.push({
      id: newSegmentacionId,
      nombre,
      imagenes: [],
      lugares: "",
      edad: "",
      segmentacionDetallada: "",
      inversion: "",
      costoPorVenta: "",
      fechaCreacion: now,
      fechaModificacion: now,
      historial: [
        {
          id: 1,
          titulo: "Segmentación creada",
          descripcion: `La segmentación "${nombre}" fue creada por ${autor}`,
          autor,
          fechaModificacion: now,
          cambios: [],
        },
      ],
    });

    set({ campañas: updatedCampañas });
    get().saveToFirestore();
  },

  deleteSegmentacion: (campañaId: number, segmentacionId: number) => {
    const state = get();
    const updatedCampañas = state.campañas.map((campaña) => {
      if (campaña.id === campañaId) {
        return {
          ...campaña,
          segmentacion: campaña.segmentacion.filter(
            (seg) => seg.id !== segmentacionId
          ),
        };
      }
      return campaña;
    });
    set({ campañas: updatedCampañas });
    get().saveToFirestore();
  },

  // ✅ Actualizado: genera historial de imágenes agregadas
  addImagenesToSegmentacion: (
    campañaId: number,
    segmentacionId: number,
    imagenesIds: number[],
    autor: string
  ) => {
    const state = get();
    const updatedCampañas = state.campañas.map((campaña) => {
      if (campaña.id === campañaId) {
        return {
          ...campaña,
          segmentacion: campaña.segmentacion.map((seg) => {
            if (seg.id === segmentacionId) {
              const existingIds = new Set(seg.imagenes);
              const newIds = imagenesIds.filter((id) => !existingIds.has(id));

              if (newIds.length === 0) return seg;

              const nuevoHistorial: HistorialSegmentacion = {
                id: seg.historial.length + 1,
                titulo:
                  newIds.length === 1
                    ? "Imagen agregada"
                    : "Imágenes agregadas",
                descripcion: `${newIds.length} imagen(es) agregada(s) por ${autor}`,
                autor,
                fechaModificacion: new Date(),
                cambios: [
                  {
                    campo: "Imágenes",
                    tipo: "agregadas",
                    imagenes: newIds,
                  },
                ],
              };

              return {
                ...seg,
                imagenes: [...seg.imagenes, ...newIds],
                fechaModificacion: new Date(),
                historial: [...seg.historial, nuevoHistorial],
              };
            }
            return seg;
          }),
        };
      }
      return campaña;
    });

    set({ campañas: updatedCampañas });
    get().saveToFirestore();
  },

  // ✅ Actualizado: genera historial de imágenes eliminadas
  removeImagenFromSegmentacion: (
    campañaId: number,
    segmentacionId: number,
    imagenesIds: number[],
    autor: string
  ) => {
    const state = get();
    const updatedCampañas = state.campañas.map((campaña) => {
      if (campaña.id === campañaId) {
        return {
          ...campaña,
          segmentacion: campaña.segmentacion.map((seg) => {
            if (seg.id === segmentacionId) {
              const imagenesIdsSet = new Set(imagenesIds);

              const nuevoHistorial: HistorialSegmentacion = {
                id: seg.historial.length + 1,
                titulo:
                  imagenesIds.length === 1
                    ? "Imagen eliminada"
                    : "Imágenes eliminadas",
                descripcion: `${imagenesIds.length} imagen(es) eliminada(s) por ${autor}`,
                autor,
                fechaModificacion: new Date(),
                cambios: [
                  {
                    campo: "Imágenes",
                    tipo: "eliminadas",
                    imagenes: imagenesIds,
                  },
                ],
              };

              return {
                ...seg,
                imagenes: seg.imagenes.filter((id) => !imagenesIdsSet.has(id)),
                fechaModificacion: new Date(),
                historial: [...seg.historial, nuevoHistorial],
              };
            }
            return seg;
          }),
        };
      }
      return campaña;
    });

    set({ campañas: updatedCampañas });
    get().saveToFirestore();
  },

  updateSegmentacionData: (
    campañaId: number,
    segmentacionId: number,
    data: Partial<Segmentacion>,
    autor: string
  ) => {
    const state = get();
    const campaña = state.campañas.find((c) => c.id === campañaId);
    if (!campaña) return;

    const segmentacion = campaña.segmentacion.find(
      (s) => s.id === segmentacionId
    );
    if (!segmentacion) return;

    const cambios: {
      campo: string;
      anterior?: string;
      nuevo?: string;
    }[] = [];
    const cambiosTexto: string[] = [];

    const campos: (keyof Segmentacion)[] = [
      "lugares",
      "edad",
      "segmentacionDetallada",
      "inversion",
      "costoPorVenta",
    ];

    campos.forEach((campo) => {
      if (data[campo] !== undefined && data[campo] !== segmentacion[campo]) {
        const valorAnterior = String(segmentacion[campo] || "No especificado");
        const valorNuevo = String(data[campo]);

        cambios.push({
          campo: campo.charAt(0).toUpperCase() + campo.slice(1),
          anterior: valorAnterior,
          nuevo: valorNuevo,
        });

        cambiosTexto.push(
          `${campo.charAt(0).toUpperCase() + campo.slice(1)} actualizado`
        );
      }
    });

    if (cambios.length === 0) {
      console.log("ℹ️ No hay cambios para guardar");
      return;
    }

    const nuevoHistorial: HistorialSegmentacion = {
      id: segmentacion.historial.length + 1,
      titulo: "Datos actualizados",
      descripcion: cambiosTexto.join(", "),
      autor,
      fechaModificacion: new Date(),
      cambios,
    };

    const updatedCampañas = state.campañas.map((c) => {
      if (c.id === campañaId) {
        return {
          ...c,
          segmentacion: c.segmentacion.map((seg) => {
            if (seg.id === segmentacionId) {
              return {
                ...seg,
                ...data,
                fechaModificacion: new Date(),
                historial: [...seg.historial, nuevoHistorial],
              };
            }
            return seg;
          }),
        };
      }
      return c;
    });

    set({ campañas: updatedCampañas });
    get().saveToFirestore();

    console.log("✅ Segmentación actualizada con historial:", cambios);
  },

  loadCampañasData: () => {
    const userDoc = doc(db, "database", "campañas");

    const unsubscribe = onSnapshot(
      userDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          const firestoreData = snapshot.data();

          const campañasConFechas = (firestoreData.campañas || []).map(
            (campaña: any) => ({
              ...campaña,
              segmentacion: (campaña.segmentacion || []).map((seg: any) => ({
                ...seg,
                fechaCreacion:
                  seg.fechaCreacion?.toDate?.() ||
                  new Date(seg.fechaCreacion || Date.now()),
                fechaModificacion:
                  seg.fechaModificacion?.toDate?.() ||
                  new Date(seg.fechaModificacion || Date.now()),
                historial: (seg.historial || []).map((h: any) => ({
                  ...h,
                  fechaModificacion:
                    h.fechaModificacion?.toDate?.() ||
                    new Date(h.fechaModificacion),
                })),
              })),
            })
          );

          set({
            campañas: campañasConFechas,
            isLoadingFromFirestore: false,
            lastId: firestoreData.lastId || 0,
          });

          console.log("✅ Campañas cargadas desde Firestore");
        } else {
          console.warn("⚠️ Store de campañas no encontrado");
          set({
            campañas: [],
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
      campañas: state.campañas,
      lastId: state.lastId,
    };

    try {
      await updateDoc(doc(db, "database", "campañas"), data);
      console.log("💾 Campañas guardadas en Firestore");
    } catch (err: any) {
      console.error("❌ Error guardando campañas:", err);
      if (err.code === "not-found") {
        try {
          await setDoc(doc(db, "database", "campañas"), data);
          console.log("📝 Documento de campañas creado");
        } catch (setErr) {
          console.error("❌ Error al crear documento:", setErr);
        }
      }
    }
  },
}));
