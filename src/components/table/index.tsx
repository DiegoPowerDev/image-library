"use client";

import styles from "@/components/styles.module.css";
import { useState, useMemo, CSSProperties } from "react";
import Card from "@/components/card/card";

import { useFireStore } from "@/store/firestore";
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";
import { useUserStore } from "@/store/userStore";
import { IconPlus } from "@tabler/icons-react";

interface Props {
  newImage?: (value: boolean) => void;
  filtros?: {
    filtroMes: string;
    filtroAño: string;
    filtroCategoriaLib: string;
    filtroCampaña: string;
    filtroCategoria?: string;
    tipoCampaña?: string;
  };
}

interface Image {
  id: number;
  nombre: string;
  url: string;
  autor: string;
  fechaModificacion: Date | string;
  fechaCreacion: Date | string;
  categoria: string;
  estado: string;
  campaña: string;
  descripcion: string;
  historial: Array<{
    id: number;
    titulo: string;
    descripcion: string;
    url: string;
    autor: string;
    fechaModificacion: Date | string;
  }>;
}

const meses = [
  "Todos",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function Table({ newImage, filtros }: Props) {
  const user = useUserStore((s) => s.currentUser);

  const sideOption = useFireStore((s) => s.sideOption);
  const items = useFireStore((s) => s.items);
  const isLoadingFromFirestore = useFireStore((s) => s.isLoadingFromFirestore);

  function toDate(fecha: Date | Timestamp | string) {
    if (!fecha) return null;
    if (fecha instanceof Date) return fecha;
    if (fecha instanceof Timestamp) return fecha.toDate();
    return new Date(fecha);
  }

  const filteredImages = useMemo(() => {
    const filtered = items.filter((img: Image) => {
      const fecha = toDate(img.fechaCreacion);
      if (!fecha) return false;

      if (sideOption === "Eliminados") {
        return img.estado === "eliminado";
      }

      if (sideOption === "Biblioteca" && filtros) {
        let matches = true;

        if (filtros.filtroMes !== "Todos") {
          const mesImagen = fecha.getMonth(); // 0-11
          const mesSeleccionado = meses.indexOf(filtros.filtroMes) - 1;
          matches = matches && mesImagen === mesSeleccionado;
        }

        if (filtros.filtroAño !== "Todos") {
          matches =
            matches && fecha.getFullYear().toString() === filtros.filtroAño;
        }

        if (filtros.filtroCategoriaLib !== "Todos") {
          matches =
            matches &&
            img.categoria.toLowerCase() ===
              filtros.filtroCategoriaLib.toLowerCase();
        }
        if (filtros.filtroCampaña !== "Todos") {
          matches =
            matches &&
            img.campaña.toLowerCase() === filtros.filtroCampaña.toLowerCase();
        }

        return matches && img.estado === "activo";
      }
      if (sideOption === "Campañas" && filtros) {
        const matchesEstado = img.estado === "activo";
        const matchesCategoria =
          filtros.filtroCategoria === "ninguna" ||
          img.categoria === filtros.filtroCategoria;
        const matchesCampaña =
          filtros.tipoCampaña === "ninguna" ||
          img.campaña === filtros.tipoCampaña;

        return matchesEstado && matchesCategoria && matchesCampaña;
      }
    });

    return filtered.sort((a, b) => {
      const fa = toDate(a.fechaCreacion)?.getTime() ?? 0;
      const fb = toDate(b.fechaCreacion)?.getTime() ?? 0;
      return fb - fa;
    });
  }, [items, sideOption, filtros]);

  return (
    <>
      {isLoadingFromFirestore ? (
        <div className="h-[90vh] flex items-center justify-center">
          <div className="flex-1 w-full flex items-center justify-center">
            <div className="w-40 h-40 border-8 border-gray-800/20 border-t-gray-800 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <div
          style={{ "--theme": "gray" } as CSSProperties}
          className={cn(
            styles.scrollContainer,
            " w-full px-4 flex flex-1 justify-center overflow-y-auto",
          )}
        >
          <div className="h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 grid-flow-row auto-cols-fr gap-4">
            {user?.role != "viewer" && newImage && (
              <button
                onClick={() => newImage(true)}
                className="border-white/40 border-2 border-dotted hover:border-solid w-64 h-64 rounded flex items-center justify-center transition-all duration-300 cursor-pointer hover:bg-white/5 group"
              >
                <IconPlus
                  color="white"
                  size={40}
                  className="group-hover:scale-110 transition-transform"
                />
              </button>
            )}

            {filteredImages.map((e) => (
              <Card key={e.id} image={e} />
            ))}
          </div>
          {filteredImages.length === 0 && sideOption != "Biblioteca" && (
            <div className="flex-1 w-full h-full text-gray-400 flex justify-center items-center select-none">
              No se encontró imagenes
            </div>
          )}
        </div>
      )}
    </>
  );
}
