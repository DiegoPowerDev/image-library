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
import { useEffect, useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Timestamp } from "firebase/firestore";
import Table from "../table";

const año = ["Todos", "2025", "2026", "2027"];

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

export default function Biblioteca() {
  const [openForm, setOpenForm] = useState(false);
  const [imagen, setImagen] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("ninguna");
  const [campaña, setCampaña] = useState("ninguna");
  const [uploading, setUploading] = useState(false);

  // Filtros de biblioteca
  const [filtroMes, setFiltroMes] = useState<string>("Todos");
  const [filtroAño, setFiltroAño] = useState<string>("Todos");
  const [filtroCategoriaLib, setFiltroCategoriaLib] = useState("Todos");
  const [filtroCampaña, setFiltroCampaña] = useState("Todos");

  const addImagen = useFireStore((s) => s.addImagen);
  const lastId = useFireStore((s) => s.lastId);
  const email = useFireStore((s) => s.email);

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

  const filtros = {
    filtroMes,
    filtroAño,
    filtroCategoriaLib,
    filtroCampaña,
  };

  return (
    <>
      <div className=" flex w-full gap-4 h-16 p-4 bg-gray-900 text-white justify-center px-4">
        <div className="flex gap-2 items-center">
          <label htmlFor="meses">Año:</label>
          <Select value={filtroAño} onValueChange={setFiltroAño}>
            <SelectTrigger className="  bg-black">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent position="popper">
              {año.map((mes) => (
                <SelectItem key={mes} value={mes}>
                  {mes}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center">
          <label htmlFor="meses">Mes:</label>
          <Select value={filtroMes} onValueChange={setFiltroMes}>
            <SelectTrigger className="  bg-black">
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
            <SelectTrigger className="w-[180px] bg-black">
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
            <SelectTrigger className="w-[180px] bg-black bg-black">
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

      <Table newImage={setOpenForm} filtros={filtros} />

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
    </>
  );
}
