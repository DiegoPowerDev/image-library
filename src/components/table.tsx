"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import styles from "@/components/styles.module.css";
import { useEffect, useRef, useState, useMemo, CSSProperties } from "react";
import Card from "./card/card";
import {
  IconBrandFacebook,
  IconBrandWordpress,
  IconChristmasTree,
  IconClearAll,
  IconFile,
  IconHomeDollar,
  IconLeaf,
  IconMoodKid,
  IconPlus,
  IconPumpkinScary,
  IconSnowflake,
  IconSun,
} from "@tabler/icons-react";
import { useFireStore } from "@/store/firestore";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import toast from "react-hot-toast";
import { Timestamp } from "firebase/firestore";
import { useUserStore } from "@/store/userStore";

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

const seccions = [
  {
    nombre: "ninguna",
    Icono: IconClearAll,
  },
  {
    nombre: "web",
    Icono: IconBrandWordpress,
  },
  {
    nombre: "redes",
    Icono: IconBrandFacebook,
  },
  {
    nombre: "volantes",
    Icono: IconFile,
  },
  {
    nombre: "Agencias",
    Icono: IconHomeDollar,
  },
];

const Campañas = [
  {
    nombre: "ninguna",
    Icono: IconClearAll,
  },
  {
    nombre: "verano",
    Icono: IconSun,
  },
  {
    nombre: "escolar",
    Icono: IconMoodKid,
  },
  {
    nombre: "otoño",
    Icono: IconLeaf,
  },
  {
    nombre: "invierno",
    Icono: IconSnowflake,
  },
  {
    nombre: "halloween",
    Icono: IconPumpkinScary,
  },
  {
    nombre: "navidad",
    Icono: IconChristmasTree,
  },
];

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

export default function Table() {
  const [openForm, setOpenForm] = useState(false);
  const [imagen, setImagen] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("ninguna");
  const [filtroCategoria, setFiltroCategoria] = useState("ninguna");
  const [campaña, setCampaña] = useState("ninguna");
  const [tipoCampaña, setTipoCampaña] = useState("ninguna");
  const [uploading, setUploading] = useState(false);

  // Filtros de biblioteca
  const [filtroMes, setFiltroMes] = useState<string>("Todos");
  const [filtroAño, setFiltroAño] = useState<string>("Todos");
  const [filtroCategoriaLib, setFiltroCategoriaLib] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Activo");
  const [filtroCampaña, setFiltroCampaña] = useState("Todos");
  const user = useUserStore((s) => s.currentUser);

  const sideOption = useFireStore((s) => s.sideOption);
  const items = useFireStore((s) => s.items);
  const isLoadingFromFirestore = useFireStore((s) => s.isLoadingFromFirestore);
  const addImagen = useFireStore((s) => s.addImagen);
  const lastId = useFireStore((s) => s.lastId);
  const email = useFireStore((s) => s.email);

  function toDate(fecha: Date | Timestamp | string) {
    if (!fecha) return null;
    if (fecha instanceof Date) return fecha;
    if (fecha instanceof Timestamp) return fecha.toDate();
    return new Date(fecha);
  }

  const fileRef = useRef<File | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fileRef.current) {
      toast.error("Por favor selecciona una imagen");
      return;
    }

    if (!titulo.trim()) {
      toast.error("Por favor ingresa un título");
      return;
    }

    setUploading(true);

    try {
      const newId = lastId + 1;
      const formData = new FormData();
      formData.append("file", fileRef.current);
      formData.append("id", String(newId));
      formData.append("historyId", "1");

      const uploadResponse = await fetch("/api/historial-images", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Error al subir la imagen");
      }

      const res = await uploadResponse.json();

      const form = {
        nombre: titulo,
        url: res.secure_url,
        imagen: res.secure_url,
        autor: email || "usuario",
        categoria: categoria,
        campaña: campaña,
        descripcion: descripcion,
      };

      await addImagen(form);
      setOpenForm(false);
      toast.success("Imagen guardada");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar");
    } finally {
      setUploading(false);
    }
  };

  const handleImage = (file: File | null) => {
    if (!file) return;

    fileRef.current = file;
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido");
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      setImagen(url);
    };

    img.onerror = () => {
      toast.error("Error al cargar la imagen");
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImage(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImage(files[0]);
    }
  };

  useEffect(() => {
    if (!openForm) {
      setImagen("");
      setTitulo("");
      setDescripcion("");
      setCampaña("ninguna");
      setCategoria("ninguna");
      fileRef.current = null;
    }
  }, [openForm]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.includes("image")) {
          const blob = items[i].getAsFile();
          handleImage(blob);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Optimizar filtrado con useMemo
  const filteredImages = useMemo(() => {
    const filtered = items.filter((img: Image) => {
      const fecha = toDate(img.fechaCreacion);
      if (!fecha) return false;

      // ===============================
      // ELIMINADOS
      // ===============================
      if (sideOption === "Eliminados") {
        return img.estado === "eliminado";
      }

      // ===============================
      // BIBLIOTECA
      // ===============================
      if (sideOption === "Biblioteca") {
        let matches = true;

        // 🔹 Filtro por MES
        if (filtroMes !== "Todos") {
          const mesImagen = fecha.getMonth(); // 0-11
          const mesSeleccionado = meses.indexOf(filtroMes) - 1;
          matches = matches && mesImagen === mesSeleccionado;
        }

        // 🔹 Filtro por AÑO
        if (filtroAño !== "Todos") {
          matches = matches && fecha.getFullYear().toString() === filtroAño;
        }

        // 🔹 Categoría
        if (filtroCategoriaLib !== "Todos") {
          matches =
            matches &&
            img.categoria.toLowerCase() === filtroCategoriaLib.toLowerCase();
        }

        // 🔹 Estado
        if (filtroEstado !== "Todos") {
          matches =
            matches && img.estado.toLowerCase() === filtroEstado.toLowerCase();
        }

        // 🔹 Campaña
        if (filtroCampaña !== "Todos") {
          matches =
            matches &&
            img.campaña.toLowerCase() === filtroCampaña.toLowerCase();
        }

        return matches;
      }

      // ===============================
      // CAMPAÑAS (NORMAL)
      // ===============================
      const matchesEstado = img.estado === "activo";
      const matchesCategoria =
        filtroCategoria === "ninguna" || img.categoria === filtroCategoria;
      const matchesCampaña =
        tipoCampaña === "ninguna" || img.campaña === tipoCampaña;

      return matchesEstado && matchesCategoria && matchesCampaña;
    });

    // ===============================
    // 🔽 ORDENAR POR FECHA (DESC)
    // ===============================
    return filtered.sort((a, b) => {
      const fa = toDate(a.fechaCreacion)?.getTime() ?? 0;
      const fb = toDate(b.fechaCreacion)?.getTime() ?? 0;
      return fb - fa; // más reciente primero
    });
  }, [
    items,
    sideOption,
    filtroMes,
    filtroAño,
    filtroCategoriaLib,
    filtroEstado,
    filtroCampaña,
    filtroCategoria,
    tipoCampaña,
  ]);

  const headerHeight = useMemo(() => {
    if (sideOption === "campañas") return "h-36";
    if (sideOption === "Biblioteca") return "h-16";
    return "h-16";
  }, [sideOption]);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 pt-2 w-full  items-center transition-all duration-300 h-full",
      )}
    >
      <div
        className={cn(
          headerHeight,
          "sticky w-full bg-black text-white justify-center transition-all duration-300",
        )}
      >
        <div className="h-full flex flex-col w-full gap-2 bg-black text-white justify-center px-4">
          {sideOption !== "Biblioteca" && sideOption !== "Eliminados" && (
            <div className="flex gap-2 w-full justify-center">
              {seccions.map((e, i) => {
                const IconComponent = e.Icono;
                return (
                  <button
                    key={i}
                    onClick={() => setFiltroCategoria(e.nombre)}
                    className={cn(
                      filtroCategoria === e.nombre
                        ? "bg-black border-white border-2"
                        : "bg-gray-500 hover:bg-gray-600",
                      "w-32 h-12 rounded text-center flex items-center justify-center transition-all duration-200 cursor-pointer gap-2 uppercase",
                    )}
                  >
                    {e.nombre}
                    <IconComponent size={20} />
                  </button>
                );
              })}
            </div>
          )}

          {sideOption === "campañas" && (
            <div className="flex gap-2 w-full justify-center overflow-x-auto pb-2">
              {Campañas.map((campaña, i) => {
                const IconComponent = campaña.Icono;
                return (
                  <button
                    key={i}
                    onClick={() => setTipoCampaña(campaña.nombre)}
                    className={cn(
                      tipoCampaña === campaña.nombre
                        ? "bg-black border-white border-2"
                        : "bg-gray-500 hover:bg-gray-600",
                      "min-w-36 h-12 rounded text-center flex items-center justify-center hover:scale-105 transition-all duration-200 cursor-pointer gap-2 uppercase",
                    )}
                  >
                    {campaña.nombre}
                    <IconComponent size={20} />
                  </button>
                );
              })}
            </div>
          )}

          {sideOption === "Biblioteca" && (
            <div className="flex gap-8 w-full justify-center items-center">
              <div className="flex gap-2 items-center">
                <label htmlFor="meses">Mes:</label>
                <Select value={filtroMes} onValueChange={setFiltroMes}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {meses.map((mes) => (
                      <SelectItem key={mes} value={mes}>
                        {mes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 items-center">
                <label htmlFor="meses">Categoria:</label>
                <Select
                  value={filtroCategoriaLib}
                  onValueChange={setFiltroCategoriaLib}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="Todos">Todos</SelectItem>
                    {seccions
                      .filter((s) => s.nombre !== "ninguna")
                      .map((s) => (
                        <SelectItem
                          key={s.nombre}
                          value={s.nombre}
                          className="capitalize"
                        >
                          {s.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 items-center">
                <label htmlFor="meses">Campaña:</label>
                <Select value={filtroCampaña} onValueChange={setFiltroCampaña}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Campaña" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="Todos">Todos</SelectItem>
                    {Campañas.filter((c) => c.nombre !== "ninguna").map((c) => (
                      <SelectItem
                        key={c.nombre}
                        value={c.nombre}
                        className="capitalize"
                      >
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
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
          {filteredImages.length != 0 ? (
            <div className="h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 grid-flow-row auto-cols-fr gap-4">
              {user?.role != "viewer" && sideOption === "Biblioteca" && (
                <button
                  onClick={() => setOpenForm(true)}
                  className="border-white/40 border-2 border-dotted hover:border-solid w-64 h-64 rounded flex items-center justify-center transition-all duration-300 cursor-pointer hover:bg-white/5 group"
                >
                  <IconPlus
                    color="white"
                    size={40}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              )}

              {/* Cards de imágenes */}
              {filteredImages.map((e) => (
                <Card key={e.id} image={e} />
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-gray-600 select-none">
                No se encontró elementos
              </div>
            </div>
          )}
        </div>
      )}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent ref={containerRef} className="w-xl">
          <DialogHeader>
            <DialogTitle className="text-center">Añadir Imagen</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form
            onSubmit={onSubmit}
            className="w-full h-full flex flex-col justify-center gap-4"
          >
            <div>
              <input
                id="imagen"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
                disabled={uploading}
              />

              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="flex items-center justify-center cursor-pointer"
                htmlFor="imagen"
              >
                {imagen ? (
                  <img
                    className="w-full max-h-48 object-contain rounded"
                    src={imagen}
                    alt="Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center font-bold w-full h-48 border-2 border-dashed rounded hover:border-solid transition-all">
                    <IconPlus size={40} />
                  </div>
                )}
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <label>Título</label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                type="text"
                placeholder="Título"
                disabled={uploading}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Descripción</label>
              <Input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                type="text"
                placeholder="Descripción"
                disabled={uploading}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col items-center gap-2 flex-1">
                <label>Categoría</label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="w-full uppercase">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {seccions.map((e, i) => (
                      <SelectItem key={i} value={e.nombre}>
                        {e.nombre.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label>Campaña</label>
                <Select value={campaña} onValueChange={setCampaña}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Campaña" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {Campañas.map((e, i) => (
                      <SelectItem key={i} value={e.nombre}>
                        {e.nombre.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex w-full gap-2 justify-center">
              <Button className="w-2/3" type="submit" disabled={uploading}>
                {uploading ? "Subiendo..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
