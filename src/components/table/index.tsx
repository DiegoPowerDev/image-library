"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import styles from "@/components/styles.module.css";
import { useMemo, CSSProperties } from "react";
import Card from "@/components/card/card";

import { useFireStore } from "@/store/firestore";
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";
import { useUserStore } from "@/store/userStore";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "../ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

const limit = [10, 20, 50, 100];

export default function Table({ newImage, filtros }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useUserStore((s) => s.currentUser);

  const sideOption = useFireStore((s) => s.sideOption);
  const items = useFireStore((s) => s.items);
  const isLoadingFromFirestore = useFireStore((s) => s.isLoadingFromFirestore);

  const page = Number(searchParams.get("page")) || 1;
  const count = Number(searchParams.get("limit")) || 10;

  const updateUrl = (newParams: { page?: number; limit?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.page) params.set("page", newParams.page.toString());
    if (newParams.limit) {
      params.set("limit", newParams.limit.toString());
      params.set("page", "1"); // Resetear a pag 1 si cambia el límite
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

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

  const paginatedImages = useMemo<Image[]>(() => {
    const startIndex = (page - 1) * count;
    const endIndex = startIndex + count;
    return filteredImages.slice(startIndex, endIndex);
  }, [count, page, filteredImages]);
  const totalPages = Math.ceil(filteredImages.length / count);

  return (
    <>
      {isLoadingFromFirestore ? (
        <div className="h-[90vh] flex items-center justify-center">
          <div className="flex-1 w-full flex items-center justify-center">
            <div className="w-40 h-40 border-8 border-gray-800/20 border-t-gray-800 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <>
          <div className=" w-full  flex flex-1 justify-center overflow-hidden">
            <div
              style={{ "--theme": "gray" } as CSSProperties}
              className={cn(
                styles.scrollContainer,
                "overflow-y-auto w-full p-4 px-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 grid-flow-row  gap-4",
              )}
            >
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

              {paginatedImages.map((e) => (
                <Card key={e.id} image={e} />
              ))}
            </div>
          </div>
          {filteredImages.length === 0 && sideOption != "Biblioteca" && (
            <div className="  w-full h-full text-gray-400 flex justify-center items-center select-none">
              No se encontró imagenes
            </div>
          )}
          <div className="w-full h-12 p-4 flex gap-4 items-center font-bold text-white bg-gray-900">
            <div className="w-full flex justify-center">
              <div className="flex gap-2 items-center">
                <label className="text-sm">Cant:</label>
                <Select
                  value={count.toString()}
                  onValueChange={(v) => updateUrl({ limit: Number(v) })}
                >
                  <SelectTrigger className="w-[80px] bg-black border-gray-700 text-white h-8 text-sm">
                    <SelectValue placeholder={count} />
                  </SelectTrigger>
                  <SelectContent>
                    {limit.map((e) => (
                      <SelectItem key={e} value={e.toString()}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <div className="flex gap-2 items-center">
                <Button
                  size="icon"
                  className="bg-black h-8 w-8 text-white hover:bg-white/10 flex justify-center"
                  disabled={page <= 1}
                  onClick={() => updateUrl({ page: page - 1 })}
                >
                  <IconChevronLeft size={20} />
                </Button>
                <div className="flex justify-center w-48 gap-2">
                  Página
                  <div className="bg-black px-3 py-1 rounded text-xs border border-gray-700">
                    {page || 1}
                  </div>
                  de {totalPages}
                </div>
                <Button
                  size="icon"
                  className="bg-black h-8 w-8 text-white hover:bg-white/10 flex justify-center"
                  disabled={page >= totalPages}
                  onClick={() => updateUrl({ page: page + 1 })}
                >
                  <IconChevronRight size={20} />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
