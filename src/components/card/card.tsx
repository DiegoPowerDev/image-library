"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timestamp } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconCheck,
  IconDownload,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useFireStore } from "@/store/firestore";
import styles from "../styles.module.css";
import { useUserStore } from "@/store/userStore";

type Fecha = Date | Timestamp | string;

const seccions = ["ninguna", "web", "redes", "volantes"];

const Campañas = [
  "ninguna",
  "verano",
  "escolar",
  "otoño",
  "invierno",
  "halloween",
  "navidad",
];

interface Historial {
  id: number;
  titulo: string;
  descripcion: string;
  url: string;
  autor: string;
  fechaModificacion: Date | Timestamp | string;
}

interface Image {
  id: number;
  nombre: string;
  url: string;
  autor: string;
  fechaModificacion: Date | Timestamp | string;
  fechaCreacion: Date | Timestamp | string;
  categoria: string;
  estado: string;
  campaña: string;
  descripcion: string;
  historial: Historial[];
}

interface Props {
  image: Image;
}

export default function Card(props: Props) {
  const [open, setOpen] = useState(false);
  const [editable, setEditable] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHistorial, setSelectedHistorial] = useState<Historial | null>(
    null,
  );
  const { image } = props;

  const [uploading, setUploading] = useState(false);
  const [imagen, setImagen] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [campaña, setCampaña] = useState("");

  const editImagen = useFireStore((s) => s.editImagen);
  const sideOption = useFireStore((s) => s.sideOption);
  const deleteImagen = useFireStore((s) => s.deleteImagen);
  const restoreImagen = useFireStore((s) => s.restoreImagen);
  const destroyImagen = useFireStore((s) => s.destroyImagen);
  const user = useUserStore((s) => s.currentUser);
  const email = useFireStore((s) => s.email);
  const formatearFecha = (fecha: Fecha): string => {
    try {
      if (fecha instanceof Date) {
        return fecha.toLocaleString("es-PE");
      }
      if (typeof fecha === "string") {
        return new Date(fecha).toLocaleString("es-PE");
      }
      return (fecha as Timestamp).toDate().toLocaleString("es-PE");
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Fecha no disponible";
    }
  };

  const fileRef = useRef<File | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Verificar si hay cambios reales antes de enviar
  const hasChanges = () => {
    const hasNewImage = !!fileRef.current;
    const hasTitleChange = titulo.trim() && titulo !== image.nombre;
    const hasDescChange =
      descripcion.trim() && descripcion !== image.descripcion;
    const hasCategoryChange = categoria && categoria !== image.categoria;
    const hasCampaignChange = campaña && campaña !== image.campaña;

    return (
      hasNewImage ||
      hasTitleChange ||
      hasDescChange ||
      hasCategoryChange ||
      hasCampaignChange
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Verificar si hay cambios antes de proceder
    if (!hasChanges()) {
      toast.error("No hay cambios para guardar");
      return;
    }

    setUploading(true);

    try {
      let newUrl = "";
      const nextHistoryId = image.historial.length + 1;

      // Si hay una nueva imagen, subirla primero con el nuevo historyId
      if (fileRef.current) {
        const formData = new FormData();
        formData.append("file", fileRef.current);
        formData.append("id", String(image.id));
        formData.append("historyId", String(nextHistoryId));

        const uploadResponse = await fetch("/api/historial-images", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Error al subir la imagen");
        }

        const res = await uploadResponse.json();
        newUrl = res.secure_url;
      }

      // Preparar los datos para editar (solo los campos que no estén vacíos)
      const editData: any = {
        id: image.id,
        autor: email,
      };

      if (titulo.trim() && titulo !== image.nombre) editData.nombre = titulo;
      if (descripcion.trim() && descripcion !== image.descripcion)
        editData.descripcion = descripcion;
      if (categoria && categoria !== image.categoria)
        editData.categoria = categoria;
      if (campaña && campaña !== image.campaña) editData.campaña = campaña;
      if (newUrl) editData.url = newUrl;

      await editImagen(editData);
      setEditable(false);
      toast.success("Cambios guardados exitosamente");

      // Limpiar campos
      setTitulo("");
      setDescripcion("");
      setCategoria("");
      setCampaña("");
      setImagen("");
      fileRef.current = null;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar los cambios");
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

  const cancelEdit = () => {
    setEditable(false);
    setTitulo("");
    setDescripcion("");
    setCategoria("");
    setCampaña("");
    setImagen("");
    fileRef.current = null;
  };

  const destroy = (id: number) => {
    destroyImagen(id);
    toast.success("IMAGEN ELIMINADA PERMANENTEMENTE", {
      style: {
        border: "1px solid red",
        color: "red",
        textAlign: "center",
        background: "black",
      },
      iconTheme: {
        primary: "red",
        secondary: "black",
      },
    });
  };

  useEffect(() => {
    if (!openDialog) {
      cancelEdit();
    }
  }, [openDialog]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!editable) return;
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
  }, [editable]);

  const handleHistorialClick = (historialItem: Historial) => {
    setSelectedHistorial(historialItem);
    setOpen(true);
  };

  const parseImagenesFromDescripcion = (
    descripcion?: string,
  ): { anterior: string; nuevo: string } | null => {
    if (!descripcion) return null;

    const regex =
      /Imagen reemplazada:\s*Anterior:\s*(https?:\/\/\S+)\s*Nuevo:\s*(https?:\/\/\S+)/i;

    const match = descripcion.match(regex);

    if (!match) return null;

    return {
      anterior: match[1],
      nuevo: match[2],
    };
  };
  const isImageReplace = selectedHistorial?.descripcion.includes(
    "Imagen reemplazada:",
  );
  const imagenes = parseImagenesFromDescripcion(selectedHistorial?.descripcion);
  const downloadImage = async (url: string, filename: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(blobUrl);
  };
  return (
    <>
      <div
        onClick={() => setOpenDialog(true)}
        className={cn(
          image.estado === "eliminado"
            ? "bg-red-500 hover:bg-red-400"
            : "bg-gray-800 hover:border-gray-400",
          "w-64 h-64 border-white border-2 text-white rounded flex flex-col items-center hover:border-gray-400 transition-colors cursor-pointer",
        )}
      >
        <div className="font-bold p-2 truncate w-full text-center">
          {image.nombre}
        </div>
        <div className="flex-1 h-full w-full flex justify-center items-center bg-black  transition-colors">
          <img
            className="max-w-full max-h-36 p-4"
            src={image.url}
            alt={image.nombre}
          />
        </div>
        <div className="flex flex-col p-2 w-full">
          <div className="text-xs flex flex-col items-center">
            <span className="text-gray-400">Última modificación:</span>
            <span className="text-xs">
              {formatearFecha(image.fechaModificacion)}
            </span>
          </div>
        </div>
      </div>

      {/* Dialog principal */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-5xl  max-h-[90vh] pr-12">
          <form onSubmit={onSubmit} className="w-full h-full">
            <div className="grid grid-rows-1 grid-cols-[1fr_4fr_4fr] gap-4 items-start h-28">
              <div className="h-full w-full flex gap-2 items-center justify-center">
                {user?.role != "viewer" && sideOption != "Meta" && (
                  <>
                    {!editable ? (
                      <div
                        className="w-12 h-12 rounded flex items-center justify-center bg-white"
                        onClick={() => setEditable(true)}
                      >
                        <IconPencil color="black" size={30} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-between gap-2">
                        <div className="flex gap-2 w-full justify-center">
                          <Button
                            type="submit"
                            variant="outline"
                            size="icon"
                            disabled={uploading}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <IconCheck size={20} />
                          </Button>
                          <Button
                            type="button"
                            onClick={cancelEdit}
                            variant="outline"
                            size="icon"
                            disabled={uploading}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <IconX size={20} />
                          </Button>
                        </div>

                        <div
                          onClick={() => {
                            if (image.estado === "activo") {
                              toast.success("Imagen eliminada");
                              return deleteImagen(image.id);
                            }
                            if (image.estado === "eliminado") {
                              toast.success("Imagen restaurada");
                              return restoreImagen(image.id);
                            }
                          }}
                          className={cn(
                            image.estado === "activo"
                              ? "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                            "h-9 w-full px-4 py-2 has-[>svg]:px-3",
                            "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
                          )}
                        >
                          {image.estado === "activo" ? (
                            <>
                              Papelera
                              <IconTrash />
                            </>
                          ) : (
                            "Restaurar"
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <DialogHeader className="h-full justify-center">
                <DialogTitle>
                  <div className="flex gap-2 items-center">
                    <label className="text-white">Título:</label>
                    {editable ? (
                      <Input
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder={image.nombre}
                        disabled={uploading}
                      />
                    ) : (
                      <span className="p-2 flex-1">{image.nombre}</span>
                    )}
                  </div>
                </DialogTitle>
                <div className="flex text-md flex-col justify-center">
                  <div className="flex gap-4 items-center">
                    <label className="text-white min-w-20">Descripción:</label>
                    {editable ? (
                      <Input
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder={image.descripcion}
                        disabled={uploading}
                      />
                    ) : (
                      <span className="">{image.descripcion}</span>
                    )}
                  </div>
                </div>
                <DialogDescription></DialogDescription>
              </DialogHeader>
              <div className="flex h-full gap-2 flex-col items-center justify-center flex-wrap">
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <span>Tipo:</span>
                    {editable ? (
                      <Select
                        value={categoria || image.categoria}
                        onValueChange={setCategoria}
                        disabled={uploading}
                      >
                        <SelectTrigger className="w-[180px] uppercase">
                          <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent position="popper" side="bottom">
                          {seccions.map((e, i) => (
                            <SelectItem key={i} value={e}>
                              {e.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="py-2 px-3 h-9 w-[180px] flex items-center text-sm rounded-md border uppercase bg-white text-black font-bold">
                        {image.categoria}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Campaña:</span>
                    {editable ? (
                      <Select
                        value={campaña || image.campaña}
                        onValueChange={setCampaña}
                        disabled={uploading}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Campaña" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {Campañas.map((e, i) => (
                            <SelectItem key={i} value={e}>
                              {e.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="py-2 px-3 h-9 w-[180px] flex items-center text-sm rounded-md border uppercase bg-white text-black font-bold">
                        {image.campaña}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 items-center justify-center">
                  <span>Creado por:</span>
                  <span className="p-2 border-2 font-bold rounded-xl bg-white text-black">
                    {image.autor}
                  </span>
                  {image.estado === "eliminado" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="px-4">
                          ELIMINAR <IconX />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-black border-2 border-red-500 text-red-500">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Alerta esta acción es irreversible
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-white">
                            La imagen se eliminará permanentemente de nuestros
                            servidores
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="px-6 text-black hover:text-white hover:bg-black">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => destroy(image.id)}
                            className="px-6 bg-red-500 hover:bg-red-800 border  font-bold"
                          >
                            ELIMINAR
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>

            <div
              ref={containerRef}
              className="w-full h-[420px] grid grid-cols-2 gap-4"
            >
              <div className="flex flex-col w-full h-full">
                <div
                  className={cn(
                    editable &&
                      !imagen &&
                      "border-dotted border-2 hover:border-solid rounded",
                    "h-full w-full flex items-center justify-center  bg-black",
                  )}
                >
                  {!editable ? (
                    <Dialog>
                      <DialogTrigger className="focus-visible:outline-0 h-full w-full flex items-center justify-center">
                        <div className="h-fit w-fit border rounded">
                          <img
                            className="max-h-80 max-w-full object-contain rounded"
                            src={image.url}
                            alt={image.nombre}
                          />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="h-fit w-fit flex items-center justify-center">
                        <DialogHeader>
                          <DialogTitle></DialogTitle>
                          <DialogDescription></DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col h-full gap-2 items-center justify-center">
                          <img
                            className="max-w-full max-h-96 p-4"
                            src={image.url}
                            alt={image.nombre}
                          />
                          <div>
                            <Button
                              onClick={() =>
                                downloadImage(
                                  image.url,
                                  image.nombre ?? "imagen",
                                )
                              }
                              variant="ghost"
                            >
                              <IconDownload size={30} />
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <>
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
                        className="flex-1 h-full flex items-center justify-center rounded cursor-pointer"
                        htmlFor="imagen"
                      >
                        {imagen ? (
                          <div className="h-fit w-fit border rounded">
                            <img
                              className="max-h-80 max-w-full object-contain rounded"
                              src={imagen}
                              alt="preview"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <IconPlus size={40} />
                            <span className="text-sm text-gray-400">
                              Click o arrastra para cambiar la imagen
                            </span>
                          </div>
                        )}
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="w-full h-full flex flex-col px-4 gap-2">
                <span className="font-bold sticky top-0 pb-2">
                  Historial ({image.historial.length}):
                </span>
                <div
                  style={{ "--theme": "gray" } as CSSProperties}
                  className={cn(
                    styles.scrollContainer,
                    "overflow-y-auto w-full flex flex-col gap-4 h-84 outline-white p-2 outline-1",
                  )}
                >
                  {image.historial && image.historial.length > 0 ? (
                    [...image.historial].reverse().map((e) => (
                      <div
                        key={e.id}
                        onClick={() => handleHistorialClick(e)}
                        className="border-white  border-2 rounded hover:bg-slate-800 flex flex-col justify-between w-full p-2 cursor-pointer transition-colors"
                      >
                        <div className="font-semibold text-sm">{e.titulo}</div>
                        <div className="text-xs  mt-1 line-clamp-2">
                          {e.descripcion}
                        </div>
                        <div className="text-xs text-gray-500  mt-1">
                          {formatearFecha(e.fechaModificacion)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">
                      No hay historial disponible
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] w-fit overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedHistorial?.titulo || "Detalle del historial"}
            </DialogTitle>
            <DialogDescription>
              {selectedHistorial?.descripcion || ""}
            </DialogDescription>
          </DialogHeader>

          <div
            style={{ "--theme": "gray" } as CSSProperties}
            className={cn(
              styles.scrollContainer,
              "flex-1 overflow-y-auto space-y-4",
            )}
          >
            {selectedHistorial && (
              <>
                {/* Detectar y mostrar cambios de campos */}
                {(() => {
                  const descripcion = selectedHistorial.descripcion;
                  const cambios: Array<{
                    campo: string;
                    anterior: string;
                    nuevo: string;
                  }> = [];

                  // Detectar cambio de título
                  const tituloMatch = descripcion.match(
                    /Título cambiado: Anterior: "([^"]*)" Nuevo: "([^"]*)"/,
                  );
                  if (tituloMatch) {
                    cambios.push({
                      campo: "Título",
                      anterior: tituloMatch[1],
                      nuevo: tituloMatch[2],
                    });
                  }

                  // Detectar cambio de descripción
                  const descripcionMatch = descripcion.match(
                    /Descripción cambiada: Anterior: "([^"]*)" Nuevo: "([^"]*)"/,
                  );
                  if (descripcionMatch) {
                    cambios.push({
                      campo: "Descripción",
                      anterior: descripcionMatch[1],
                      nuevo: descripcionMatch[2],
                    });
                  }

                  // Detectar cambio de categoría
                  const categoriaMatch = descripcion.match(
                    /Categoría cambiada: Anterior: "([^"]*)" Nuevo: "([^"]*)"/,
                  );
                  if (categoriaMatch) {
                    cambios.push({
                      campo: "Categoría",
                      anterior: categoriaMatch[1],
                      nuevo: categoriaMatch[2],
                    });
                  }

                  // Detectar cambio de campaña
                  const campañaMatch = descripcion.match(
                    /Campaña cambiada: Anterior: "([^"]*)" Nuevo: "([^"]*)"/,
                  );
                  if (campañaMatch) {
                    cambios.push({
                      campo: "Campaña",
                      anterior: campañaMatch[1],
                      nuevo: campañaMatch[2],
                    });
                  }

                  // Detectar cambio de imagen
                  const imagenMatch = descripcion.match(
                    /Imagen reemplazada:\s*Anterior:\s*(https?:\/\/\S+)\s*Nuevo:\s*(https?:\/\/\S+)/,
                  );

                  return (
                    <>
                      {cambios.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-sm text-zinc-400 uppercase">
                            Cambios realizados:
                          </h3>

                          {cambios.map((cambio, idx) => (
                            <div
                              key={idx}
                              className="bg-zinc-900 p-4 rounded-lg space-y-2"
                            >
                              <div className="font-semibold text-blue-400">
                                {cambio.campo}
                              </div>

                              <div className="space-y-2">
                                <div className="bg-red-900/30 p-3 rounded border-l-4 border-red-500">
                                  <div className="text-xs text-red-400 mb-1">
                                    Anterior:
                                  </div>
                                  <div className="text-sm">
                                    {cambio.anterior}
                                  </div>
                                </div>

                                <div className="bg-green-900/30 p-3 rounded border-l-4 border-green-500">
                                  <div className="text-xs text-green-400 mb-1">
                                    Nuevo:
                                  </div>
                                  <div className="text-sm">{cambio.nuevo}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Mostrar cambio de imagen */}
                      {imagenMatch && (
                        <div className="bg-zinc-900 p-4 rounded-lg space-y-3">
                          <div className="font-semibold text-blue-400">
                            Imagen reemplazada
                          </div>
                          <div className="space-y-2">
                            <div className="bg-red-900/30 p-3 rounded border-l-4 border-red-500">
                              <div className="text-xs text-red-400 mb-1">
                                Anterior:
                              </div>
                              <div className="text-sm break-all">
                                {imagenMatch[1]}
                              </div>
                            </div>

                            <div className="bg-green-900/30 p-3 rounded border-l-4 border-green-500">
                              <div className="text-xs text-green-400 mb-1">
                                Nueva:
                              </div>
                              <div className="text-sm break-all">
                                {imagenMatch[2]}
                              </div>
                            </div>
                          </div>{" "}
                          {selectedHistorial?.url &&
                            (isImageReplace ? (
                              <div className="grid grid-cols-2 gap-4 h-full">
                                <div className="flex flex-col items-center justify-center">
                                  <span className="text-sm text-gray-400 mb-2">
                                    Anterior
                                  </span>

                                  <Dialog>
                                    <DialogTrigger className="focus-visible:outline-0 h-full w-full flex items-center justify-center">
                                      <div>
                                        <img
                                          className="max-h-80 w-full object-contain border rounded"
                                          src={imagenes?.anterior}
                                          alt="Imagen anterior"
                                        />
                                      </div>
                                    </DialogTrigger>
                                    <DialogContent className="h-fit w-fit flex items-center justify-center">
                                      <DialogHeader>
                                        <DialogTitle></DialogTitle>
                                        <DialogDescription></DialogDescription>
                                      </DialogHeader>
                                      <div className="flex flex-col h-full gap-2 items-center justify-center">
                                        <img
                                          className="max-w-full max-h-96 p-4"
                                          src={imagenes?.anterior}
                                          alt={image.nombre}
                                        />
                                        <div>
                                          <Button
                                            onClick={() =>
                                              downloadImage(
                                                imagenes?.anterior || "",
                                                "imagen",
                                              )
                                            }
                                            variant="ghost"
                                          >
                                            <IconDownload size={30} />
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>

                                <div className="flex flex-col items-center">
                                  <span className="text-sm text-gray-520 mb-2">
                                    Nueva
                                  </span>
                                  <div className="flex h-full flex-col items-center justify-center">
                                    <Dialog>
                                      <DialogTrigger className="focus-visible:outline-0 h-full w-full flex items-center justify-center">
                                        <div>
                                          <img
                                            className="max-h-80 w-full object-contain border rounded"
                                            src={imagenes?.nuevo}
                                            alt="Imagen nueva"
                                          />
                                        </div>
                                      </DialogTrigger>
                                      <DialogContent className="h-fit w-fit flex items-center justify-center">
                                        <DialogHeader>
                                          <DialogTitle></DialogTitle>
                                          <DialogDescription></DialogDescription>
                                        </DialogHeader>
                                        <div className="flex flex-col h-full gap-2 items-center justify-center">
                                          <img
                                            className="max-w-full max-h-96 p-4"
                                            src={imagenes?.nuevo}
                                            alt={image.nombre}
                                          />
                                          <div>
                                            <Button
                                              onClick={() =>
                                                downloadImage(
                                                  imagenes?.nuevo || "",
                                                  "imagen",
                                                )
                                              }
                                              variant="ghost"
                                            >
                                              <IconDownload size={30} />
                                            </Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center">
                                <span className="text-sm text-gray-400 mb-2">
                                  Imagen
                                </span>

                                <Dialog>
                                  <DialogTrigger className="focus-visible:outline-0 h-full w-full flex items-center justify-center">
                                    <div>
                                      <img
                                        className="max-h-40 xl:max-h-80 w-full object-contain border rounded"
                                        src={selectedHistorial.url}
                                        alt="Imagen"
                                      />
                                    </div>
                                  </DialogTrigger>
                                  <DialogContent className="h-fit w-fit flex items-center justify-center">
                                    <DialogHeader>
                                      <DialogTitle></DialogTitle>
                                      <DialogDescription></DialogDescription>
                                    </DialogHeader>
                                    <div className="flex flex-col h-full gap-2 items-center justify-center">
                                      <img
                                        className="max-w-full max-h-96 p-4"
                                        src={selectedHistorial.url}
                                        alt="Imagen"
                                      />
                                      <div>
                                        <Button
                                          onClick={() =>
                                            downloadImage(
                                              selectedHistorial.url,
                                              "imagen",
                                            )
                                          }
                                          variant="ghost"
                                        >
                                          <IconDownload size={30} />
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            ))}
                        </div>
                      )}
                      {/* Si es creación de imagen */}
                      {selectedHistorial.titulo === "Imagen creada" &&
                        selectedHistorial.url && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-zinc-400 uppercase">
                              Información inicial:
                            </h3>

                            <div className="bg-zinc-900 p-4 rounded-lg space-y-3">
                              <div className="font-semibold text-green-400">
                                Imagen creada
                              </div>

                              {/* Preview de la imagen */}
                              <div className="bg-green-900/30 p-3 rounded border-l-4 border-green-500">
                                <Dialog>
                                  <DialogTrigger className="focus-visible:outline-0 w-full">
                                    <img
                                      className="w-full h-60 object-contain border rounded cursor-pointer hover:opacity-80 transition-opacity"
                                      src={selectedHistorial.url}
                                      alt="Imagen creada"
                                    />
                                  </DialogTrigger>
                                  <DialogContent className="h-fit w-fit flex items-center justify-center">
                                    <DialogHeader>
                                      <DialogTitle></DialogTitle>
                                      <DialogDescription></DialogDescription>
                                    </DialogHeader>
                                    <div className="flex flex-col gap-2 items-center justify-center">
                                      <img
                                        className="max-w-full max-h-96 p-4"
                                        src={selectedHistorial.url}
                                        alt="Imagen creada"
                                      />
                                      <Button
                                        onClick={() =>
                                          downloadImage(
                                            selectedHistorial.url,
                                            "imagen",
                                          )
                                        }
                                        variant="ghost"
                                      >
                                        <IconDownload size={30} />
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>

                              {/* Detectar y mostrar características iniciales desde la descripción */}
                              {(() => {
                                const desc = selectedHistorial.descripcion;
                                const caracteristicas: Array<{
                                  campo: string;
                                  valor: string;
                                }> = [];

                                // Detectar título
                                const tituloMatch =
                                  desc.match(/Título: "([^"]*)"/);
                                if (tituloMatch) {
                                  caracteristicas.push({
                                    campo: "Título",
                                    valor: tituloMatch[1],
                                  });
                                }

                                // Detectar descripción
                                const descripcionMatch = desc.match(
                                  /Descripción: "([^"]*)"/,
                                );
                                if (descripcionMatch) {
                                  caracteristicas.push({
                                    campo: "Descripción",
                                    valor: descripcionMatch[1],
                                  });
                                }

                                // Detectar categoría
                                const categoriaMatch =
                                  desc.match(/Categoría: "([^"]*)"/);
                                if (categoriaMatch) {
                                  caracteristicas.push({
                                    campo: "Categoría",
                                    valor: categoriaMatch[1],
                                  });
                                }

                                // Detectar campaña
                                const campañaMatch =
                                  desc.match(/Campaña: "([^"]*)"/);
                                if (campañaMatch) {
                                  caracteristicas.push({
                                    campo: "Campaña",
                                    valor: campañaMatch[1],
                                  });
                                }

                                return (
                                  <>
                                    {caracteristicas.length > 0 && (
                                      <div className="space-y-2 mt-3">
                                        <div className="text-xs text-green-400 font-medium">
                                          Características:
                                        </div>
                                        {caracteristicas.map((item, idx) => (
                                          <div
                                            key={idx}
                                            className="bg-green-900/20 p-2 rounded border border-green-500/30"
                                          >
                                            <div className="text-xs text-green-400">
                                              {item.campo}:
                                            </div>
                                            <div className="text-sm mt-1">
                                              {item.valor}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* URL de la imagen */}
                                    <div className="bg-green-900/20 p-2 rounded border border-green-500/30 mt-2">
                                      <div className="text-xs text-green-400">
                                        URL:
                                      </div>
                                      <div className="text-xs mt-1 break-all opacity-70">
                                        {selectedHistorial.url}
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                    </>
                  );
                })()}

                {/* Información del autor y fecha */}
                <div className="flex justify-between items-center pt-4 border-t border-zinc-700">
                  <div className="flex gap-4">
                    <span className="text-zinc-400 text-sm">Autor:</span>
                    <span className="text-sm">{selectedHistorial.autor}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-zinc-400 text-sm">Fecha:</span>
                    <span className="text-sm">
                      {formatearFecha(selectedHistorial.fechaModificacion)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
