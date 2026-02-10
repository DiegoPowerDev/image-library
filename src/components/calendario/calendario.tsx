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
import { CSSProperties, useState, useEffect, Fragment } from "react";
import styles from "@/components/styles.module.css";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import {
  IconTableSpark,
  IconPlus,
  IconTrash,
  IconX,
  IconSearch,
  IconFilter,
  IconHistory,
  IconCheck,
  IconEdit,
  IconDownload,
} from "@tabler/icons-react";
import { DialogClose, DialogTrigger } from "@radix-ui/react-dialog";
import { useTareasStore } from "@/store/tareaStore";
import { useFireStore } from "@/store/firestore";
import toast from "react-hot-toast";
import Card from "../card/card";

const años = [2026];

const meses = [
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

const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const estados = [
  {
    value: "activo",
    label: "Activo",
    color: "#51A2FF",
  },
  {
    value: "urgente",
    label: "Urgente",
    color: "#FF6467",
  },
  {
    value: "terminado",
    label: "Terminado",
    color: "#364153",
  },
];

export default function Calendario() {
  const [imagenesDialog, setImagenesDialog] = useState(false);
  const [editable, setEditable] = useState(false);
  const isLoadingFromFirestore = useTareasStore(
    (s) => s.isLoadingFromFirestore,
  );
  const [año, setAño] = useState<number>(2026);
  const [mes, setMes] = useState<number>(new Date().getMonth());
  const [open, setOpen] = useState(false);
  const [openHistorialDialog, setOpenHistorialDialog] = useState(false);
  const [selectedHistorial, setSelectedHistorial] = useState<any | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<number | null>(
    null,
  );

  // Formulario
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState<number[]>(
    [],
  );
  const [estado, setEstado] = useState("activo");

  const [busquedaImagenes, setBusquedaImagenes] = useState("");

  const {
    tareas,
    loadTareasData,
    addTarea,
    updateTarea,
    deleteTarea,
    getTareasByDate,
  } = useTareasStore();

  const { items, email } = useFireStore();
  const autor = email || "Usuario";

  // Filtrar solo imágenes activas
  const imagenesActivas = items.filter((img) => img.estado === "activo");

  // Filtrar imágenes por búsqueda
  const imagenesFiltradas = busquedaImagenes
    ? imagenesActivas.filter(
        (img) =>
          img.nombre.toLowerCase().includes(busquedaImagenes.toLowerCase()) ||
          img.descripcion
            .toLowerCase()
            .includes(busquedaImagenes.toLowerCase()) ||
          img.estado.toLowerCase().includes(busquedaImagenes.toLowerCase()),
      )
    : imagenesActivas;

  useEffect(() => {
    const unsubscribe = loadTareasData();
    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (dia: number, tareaId?: number) => {
    setDiaSeleccionado(dia);

    if (tareaId !== undefined) {
      const tarea = tareas.find((t) => t.id === tareaId);
      if (tarea) {
        setTareaSeleccionada(tareaId);
        setTitulo(tarea.titulo);
        setDescripcion(tarea.descripcion);
        setEstado(tarea.estado);
        setImagenesSeleccionadas([...tarea.imagenes]);
        setModoEdicion(true);
        setEditable(false);
      }
    } else {
      setTareaSeleccionada(null);
      setTitulo("");
      setDescripcion("");
      setEstado("");
      setImagenesSeleccionadas([]);
      setModoEdicion(false);
      setEditable(true);
    }

    setBusquedaImagenes("");
    setOpen(true);
  };

  const handleGuardar = () => {
    if (!titulo.trim() || !diaSeleccionado || año === null || mes === null) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    if (modoEdicion && tareaSeleccionada !== null) {
      const tarea = tareas.find((t) => t.id === tareaSeleccionada);
      if (tarea) {
        const imagenesAnteriores = new Set(tarea.imagenes);
        const imagenesNuevas = new Set(imagenesSeleccionadas);

        // Calcular cambios en imágenes
        const agregadas = imagenesSeleccionadas.filter(
          (id) => !imagenesAnteriores.has(id),
        );
        const eliminadas = tarea.imagenes.filter(
          (id) => !imagenesNuevas.has(id),
        );

        // Determinar si hay cambios en el formulario
        const hayCambiosTexto =
          titulo !== tarea.titulo ||
          descripcion !== tarea.descripcion ||
          estado !== tarea.estado;

        const hayCambiosImagenes =
          agregadas.length > 0 || eliminadas.length > 0;

        // Si hay cualquier tipo de cambio, actualizar todo en una sola llamada
        if (hayCambiosTexto || hayCambiosImagenes) {
          updateTarea(
            tareaSeleccionada,
            {
              titulo,
              descripcion,
              estado,
            },
            agregadas, // Imágenes agregadas
            eliminadas, // Imágenes eliminadas
            autor,
          );
          toast.success("Tarea actualizada exitosamente");
        } else {
          toast.success("No hay cambios para guardar");
        }
      }
    } else {
      // Crear nueva tarea con imágenes incluidas
      const fecha = new Date(año, mes, diaSeleccionado);
      let nuevoEstado;
      if (estado === "") {
        nuevoEstado = "activo";
      } else {
        nuevoEstado = estado;
      }
      console.log(estado);
      addTarea(
        fecha,
        titulo,
        descripcion,
        imagenesSeleccionadas,
        autor,
        nuevoEstado,
      );

      toast.success("Tarea creada exitosamente");
    }

    setOpen(false);
    resetFormulario();
  };

  const handleEliminar = () => {
    if (tareaSeleccionada !== null) {
      deleteTarea(tareaSeleccionada);
      toast.success("Tarea eliminada");
      setOpen(false);
      resetFormulario();
    }
  };

  const resetFormulario = () => {
    setTitulo("");
    setDescripcion("");
    setEstado("");
    setImagenesSeleccionadas([]);
    setModoEdicion(false);
    setTareaSeleccionada(null);
    setBusquedaImagenes("");
    setEditable(false);
  };

  const toggleImagen = (imagenId: number) => {
    setImagenesSeleccionadas((prev) =>
      prev.includes(imagenId)
        ? prev.filter((id) => id !== imagenId)
        : [...prev, imagenId],
    );
  };

  const removeImagen = (imagenId: number) => {
    setImagenesSeleccionadas((prev) => prev.filter((id) => id !== imagenId));
  };

  const handleHistorialClick = (historial: any) => {
    setSelectedHistorial(historial);
    setOpenHistorialDialog(true);
  };

  // Obtener objetos Image completos desde los IDs
  const listaDeImagenes = imagenesSeleccionadas
    .map((id) => items.find((img) => img.id === id))
    .filter(Boolean);

  const tareabuscada =
    tareaSeleccionada !== null
      ? tareas.find((t) => t.id === tareaSeleccionada)
      : null;

  const imagenesTarea = tareabuscada
    ? items
        .filter((img) => tareabuscada.imagenes.includes(img.id))
        .filter((img) => img.estado !== "eliminado")
    : [];

  const diasDelMes = new Date(año, mes + 1, 0).getDate();
  const firstDay = new Date(año, mes, 1).getDay();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const tarea =
    tareaSeleccionada !== null
      ? tareas.find((t) => t.id === tareaSeleccionada)
      : null;

  return (
    <>
      {isLoadingFromFirestore ? (
        <div className="h-[90vh] flex items-center justify-center">
          <div className="flex-1 w-full flex items-center justify-center">
            <div className="w-40 h-40 border-8 border-gray-800/20 border-t-gray-800 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className=" w-full h-screen text-white flex flex-col items-center overflow-x-hidden">
          {/* Header con Selectores y Filtros */}
          <div className="w-full h-16 flex bg-gray-900 items-center justify-center ">
            <div className="flex gap-4  items-center justify-between">
              <div className="flex gap-4 items-center">
                <Select onValueChange={(v) => setAño(Number(v))}>
                  <SelectTrigger className="w-[180px] bg-black ext-white font-bold">
                    <SelectValue placeholder={año} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-none">
                    {años.map((a) => (
                      <SelectItem key={a} value={String(a)}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={(v) => setMes(meses.indexOf(v))}>
                  <SelectTrigger className="w-[180px] bg-black text-white font-bold">
                    <SelectValue placeholder={meses[mes]} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-none">
                    {meses.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="h-10 grid grid-cols-7 w-full place-content-center px-12">
            {diasSemana.map((d) => (
              <div
                key={d}
                className="h-4 text-center font-semibold text-zinc-400"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendario */}
          <div
            style={{ "--theme": "gray" } as CSSProperties}
            className={cn(
              styles.scrollContainer,
              "grid grid-cols-7 flex-1 w-full overflow-y-auto px-12",
            )}
          >
            {/* Espacios vacíos */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Días */}
            {Array.from({ length: diasDelMes }, (_, i) => i + 1).map((dia) => {
              const tareasDelDia = getTareasByDate(año, mes, dia).filter((t) =>
                tareas.some((tf) => tf.id === t.id),
              );

              return (
                <div
                  key={dia}
                  className={cn(
                    styles.scrollContainer,
                    "h-40 w-full border flex flex-col bg-zinc-800",
                  )}
                >
                  <div className="flex h-full w-full flex-col">
                    <div className="sticky bg-zinc-800 flex justify-between items-center px-2 py-1 z-10">
                      <span onClick={() => console.log(tareasDelDia)}>
                        {dia}
                      </span>
                      <button
                        onClick={() => handleOpenDialog(dia)}
                        className="hover:bg-zinc-700 p-1 rounded"
                        title="Agregar tarea"
                      >
                        <IconPlus size={16} />
                      </button>
                    </div>
                    <div
                      style={{ "--theme": "gray" } as CSSProperties}
                      className={cn(
                        styles.scrollContainer,
                        "flex flex-col gap-2 items-center w-full p-2 overflow-x-hidden overflow-y-auto",
                      )}
                    >
                      {tareasDelDia.map((tarea, i) => (
                        <button
                          key={i}
                          style={{
                            backgroundColor:
                              tarea?.estado === "terminado"
                                ? "#364153"
                                : tarea?.estado === "urgente"
                                  ? "#FF6467"
                                  : "#51A2FF",
                          }}
                          onClick={() => handleOpenDialog(dia, tarea.id)}
                          className={`hover:opacity-90 min-h-8 flex gap-2 items-center justify-start p-1 rounded-xl w-full transition-all `}
                        >
                          <IconTableSpark size={18} />
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="truncate text-sm font-semibold w-full text-left">
                              {tarea.titulo}
                            </span>
                            {tarea.imagenes.length > 0 && (
                              <span className="text-xs opacity-75">
                                {items
                                  .filter((e) => tarea.imagenes.includes(e.id))
                                  .filter((e) => e.estado != "eliminado")
                                  .length === 0 && ""}
                                {items
                                  .filter((e) => tarea.imagenes.includes(e.id))
                                  .filter((e) => e.estado != "eliminado")
                                  .length === 1 && "1 Imagen"}
                                {items
                                  .filter((e) => tarea.imagenes.includes(e.id))
                                  .filter((e) => e.estado != "eliminado")
                                  .length > 1 &&
                                  `${
                                    items
                                      .filter((e) =>
                                        tarea.imagenes.includes(e.id),
                                      )
                                      .filter((e) => e.estado != "eliminado")
                                      .length
                                  } imagenes`}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
              style={{
                border:
                  estado === "terminado"
                    ? "1px solid #364153"
                    : estado === "urgente"
                      ? "1px solid #FF6467"
                      : "1px solid #51A2FF",
              }}
              className={cn(
                imagenesTarea.length < 3 && "w-1/3",
                imagenesTarea.length >= 3 && " w-1/2 ",
                imagenesTarea.length != 0 && "min-h-[75vh]",
                editable && " w-1/2",
                "max-h-[90vh]  ",
                "flex flex-col ",
              )}
            >
              <DialogHeader>
                <DialogTitle className="text-center flex-1 flex items-center justify-center gap-4">
                  {diaSeleccionado} de {meses[mes]} {año}
                  {!editable && (
                    <div
                      style={{
                        backgroundColor:
                          tarea?.estado === "terminado"
                            ? "#364153"
                            : tarea?.estado === "urgente"
                              ? "#FF6467"
                              : "#51A2FF",
                      }}
                      className={`text-white uppercase p-2 rounded flex items-center justify-center`}
                    >
                      {tarea?.estado}
                    </div>
                  )}
                </DialogTitle>
              </DialogHeader>

              <Tabs
                defaultValue="detalles"
                style={{ "--theme": "gray" } as CSSProperties}
                className={cn(
                  styles.scrollContainer,
                  "flex-1  overflow-x-hidden overflow-y-auto flex p-4    flex-col",
                )}
              >
                <div className="w-full flex justify-end">
                  {!editable && (
                    <TabsList
                      className={cn(
                        listaDeImagenes.length === 0 || !editable
                          ? "flex w-full"
                          : "flex w-1/3",
                      )}
                    >
                      <TabsTrigger className="cursor-pointer" value="detalles">
                        Detalles
                      </TabsTrigger>

                      <TabsTrigger
                        className="cursor-pointer"
                        value="historial"
                        disabled={editable}
                      >
                        <IconHistory size={16} className="mr-2" />
                        Historial
                      </TabsTrigger>
                    </TabsList>
                  )}
                </div>
                {/* Tab: Detalles */}
                <TabsContent
                  value="detalles"
                  className={cn("space-y-4  flex-1")}
                >
                  <div
                    onClick={() => console.log(tarea)}
                    className="w-full flex justify-between"
                  >
                    {editable && (
                      <Select value={estado} onValueChange={setEstado}>
                        <SelectTrigger
                          style={{
                            backgroundColor:
                              estado === "terminado"
                                ? "#364153"
                                : estado === "urgente"
                                  ? "#FF6467"
                                  : "#51A2FF",
                            color: "white",
                          }}
                          className={` w-[120px] font-bold`}
                        >
                          <SelectValue placeholder="ESTADO" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {estados.map((e) => (
                            <SelectItem
                              style={{
                                backgroundColor: e.color,
                                color: "white",
                              }}
                              className="font-bold"
                              key={e.value}
                              value={e.value}
                            >
                              {e.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      onClick={() => setEditable(!editable)}
                      variant="ghost"
                      size="sm"
                      className="gap-2 border"
                    >
                      <IconEdit size={16} />
                      {editable ? "Cancelar" : "Editar"}
                    </Button>
                  </div>
                  <div className={cn("flex flex-col", " gap-6 h-full")}>
                    {/* Columna izquierda: Preview de imágenes */}
                    {(imagenesTarea.length != 0 || editable) && (
                      <>
                        <div
                          style={{ "--theme": "gray" } as CSSProperties}
                          className={cn(
                            "h-[30vh]",
                            styles.scrollContainer,
                            "w-full   flex justify-center border ",
                          )}
                        >
                          {editable ? (
                            <div
                              className={cn(
                                "grid grid-cols-3 grid-flow-row gap-2 overflow-y-auto overflow-x-hidden w-full ",
                              )}
                            >
                              <div className="w-full h-full flex p-2 justify-center">
                                <div
                                  onClick={() => setImagenesDialog(true)}
                                  className="h-64 w-64 border-dotted border cursor-pointer flex items-center justify-center"
                                >
                                  <IconPlus size={50} />
                                </div>
                              </div>
                              {listaDeImagenes.map((img) => (
                                <Fragment key={img?.id}>
                                  {img && img.estado != "eliminado" && (
                                    <div
                                      key={img?.id}
                                      className="w-full h-full flex  justify-center p-2 relative group"
                                    >
                                      <Card key={img.id} image={img} />
                                      <button
                                        onClick={() => removeImagen(img!.id)}
                                        className="absolute top-1 right-1 bg-red-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <IconX size={14} />
                                      </button>
                                    </div>
                                  )}
                                </Fragment>
                              ))}
                            </div>
                          ) : (
                            <div
                              className={cn(
                                imagenesTarea.length < 3
                                  ? "justify-center flex"
                                  : "grid-cols-3 grid  grid-flow-row",
                                " gap-2 overflow-y-auto w-full ",
                              )}
                            >
                              {listaDeImagenes.map((img) => (
                                <Fragment key={img?.id}>
                                  {img && img.estado != "eliminado" && (
                                    <div
                                      key={img?.id}
                                      className="w-full h-full flex  justify-center p-2"
                                    >
                                      <Card key={img.id} image={img} />
                                    </div>
                                  )}
                                </Fragment>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Columna derecha: Formulario */}
                    <div className="flex flex-col justify-center">
                      {editable ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">
                              Título *
                            </label>
                            <Input
                              value={titulo}
                              disabled={!editable}
                              onChange={(e) => setTitulo(e.target.value)}
                              placeholder="Título de la tarea"
                              className={cn(
                                !editable && "border-transparent",
                                "mt-1",
                              )}
                            />
                          </div>

                          <div className="flex flex-col">
                            <label className="text-sm font-medium">
                              Descripción
                            </label>
                            <textarea
                              style={{ "--theme": "gray" } as CSSProperties}
                              rows={3}
                              value={descripcion}
                              disabled={!editable}
                              onChange={(e) => setDescripcion(e.target.value)}
                              placeholder="Descripción de la tarea"
                              className={cn(
                                styles.scrollContainer,
                                !editable
                                  ? "border-transparent opacity-50"
                                  : "mt-1  border-white border rounded-lg p-2",
                                "resize-none",
                              )}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm font-medium">
                              Título *
                            </span>
                            <div className={cn("border-transparent", "mt-1")}>
                              {tarea?.titulo}
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              Descripción
                            </span>
                            <div
                              className={cn(
                                !editable
                                  ? "border-transparent opacity-50"
                                  : "mt-1  border-white border rounded-lg p-2",
                              )}
                            >
                              {tarea?.descripcion}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Botones de acción */}
                      <div className="flex justify-end gap-2 pt-4">
                        {modoEdicion && editable && (
                          <AlertDialog>
                            <AlertDialogTrigger className=" bg-red-500 flex w-16 gap-4 items-center justify-center rounded p-2 group-hover:opacity-100 transition-opacity">
                              <IconTrash size={18} />
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-black text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Estás seguro?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esto eliminará la tarea definitivamente de la
                                  base de datos. Las imágenes continuarán en la
                                  biblioteca.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-black">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 text-black hover:bg-red-700 font-bold"
                                  onClick={handleEliminar}
                                >
                                  Continuar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <DialogClose asChild>
                          <Button variant="ghost" className="border">
                            Cerrar
                          </Button>
                        </DialogClose>
                        {editable && (
                          <Button
                            onClick={handleGuardar}
                            disabled={!titulo.trim()}
                          >
                            {modoEdicion ? "Guardar Cambios" : "Crear Tarea"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Imágenes */}

                {/* Tab: Historial */}
                <TabsContent
                  style={{ "--theme": "gray" } as CSSProperties}
                  value="historial"
                  className={cn(
                    styles.scrollContainer,
                    "space-y-4 overflow-y-auto flex-1",
                  )}
                >
                  {tarea && tarea.historial.length > 0 ? (
                    <div className="space-y-3">
                      {[...tarea.historial].reverse().map((h) => (
                        <div
                          key={h.id}
                          onClick={() => handleHistorialClick(h)}
                          className="p-4 bg-zinc-800 rounded-lg space-y-2 hover:bg-zinc-700 cursor-pointer transition-colors border-2 border-transparent hover:border-white"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">{h.titulo}</h4>
                              <p className="text-sm text-zinc-400 line-clamp-2">
                                {h.descripcion}
                              </p>
                            </div>
                            <span className="text-xs text-zinc-500 ml-4 whitespace-nowrap">
                              {new Date(h.fechaModificacion).toLocaleString(
                                "es-PE",
                              )}
                            </span>
                          </div>
                          <div className="text-sm text-zinc-500">
                            Por: {h.autor}
                          </div>
                          {h.cambios && h.cambios.length > 0 && (
                            <div className="mt-2 text-xs text-zinc-400">
                              {h.cambios.length} cambio(s) realizados
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-zinc-500 py-8">
                      No hay historial disponible
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          {/* Dialog de Detalle del Historial */}
          <Dialog
            open={openHistorialDialog}
            onOpenChange={setOpenHistorialDialog}
          >
            <DialogContent className="max-w-3xl w-fit max-h-[90vh] overflow-hidden flex flex-col">
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
                    {/* Mostrar cambios detallados de campos de texto */}
                    {selectedHistorial.cambios &&
                      selectedHistorial.cambios.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-sm text-zinc-400 uppercase">
                            Cambios realizados:
                          </h3>

                          {selectedHistorial.cambios.map(
                            (cambio: any, idx: number) => {
                              // Cambios en campos de texto (Título, Descripción, Fecha)
                              if (
                                cambio.anterior !== undefined &&
                                cambio.nuevo !== undefined
                              ) {
                                return (
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
                                        <div className="text-sm">
                                          {cambio.nuevo}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              // Cambios en imágenes eliminadas
                              if (
                                cambio.campo === "Imágenes" &&
                                cambio.tipo === "eliminadas"
                              ) {
                                const imagenesEliminadas = cambio.imagenes
                                  .map((id: number) =>
                                    items.find((img) => img.id === id),
                                  )
                                  .filter(Boolean);

                                return (
                                  <div
                                    key={idx}
                                    className="bg-zinc-900 p-4 rounded-lg space-y-3"
                                  >
                                    <div className="font-semibold text-red-400">
                                      Imágenes eliminadas (
                                      {imagenesEliminadas.length})
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                      {imagenesEliminadas.map((img: any) => (
                                        <Card key={img.id} image={img} />
                                      ))}
                                    </div>
                                  </div>
                                );
                              }

                              // Cambios en imágenes agregadas
                              if (
                                cambio.campo === "Imágenes" &&
                                cambio.tipo === "agregadas"
                              ) {
                                const imagenesAgregadas = cambio.imagenes
                                  .map((id: number) =>
                                    items.find((img) => img.id === id),
                                  )
                                  .filter(Boolean);

                                return (
                                  <div
                                    key={idx}
                                    className="bg-zinc-900 p-4 rounded-lg space-y-3"
                                  >
                                    <div className="font-semibold text-green-400">
                                      Imágenes agregadas (
                                      {imagenesAgregadas.length})
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                      {imagenesAgregadas.map((img: any) => (
                                        <Card key={img.id} image={img} />
                                      ))}
                                    </div>
                                  </div>
                                );
                              }

                              return null;
                            },
                          )}
                        </div>
                      )}

                    {/* Información del autor y fecha */}
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-700">
                      <div className="flex gap-4">
                        <span className="text-zinc-400 text-sm">Autor:</span>
                        <span className="text-sm">
                          {selectedHistorial.autor}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-zinc-400 text-sm">Fecha:</span>
                        <span className="text-sm">
                          {new Date(
                            selectedHistorial.fechaModificacion,
                          ).toLocaleString("es-PE")}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <Dialog open={imagenesDialog} onOpenChange={setImagenesDialog}>
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogContent className="w-2/3 max-h-[70vh]">
          <div className="relative">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <Input
              value={busquedaImagenes}
              onChange={(e) => setBusquedaImagenes(e.target.value)}
              placeholder="Buscar imágenes..."
              className="pl-10"
            />
          </div>

          {/* Grid de imágenes */}
          <div
            style={{ "--theme": "gray" } as CSSProperties}
            className={cn(
              styles.scrollContainer,
              "grid grid-cols-5 gap-4 overflow-y-auto max-h-[calc(90vh-300px)]",
            )}
          >
            {imagenesFiltradas.length === 0 ? (
              <div className="col-span-5 text-center text-zinc-500 py-8">
                No hay imágenes disponibles
              </div>
            ) : (
              imagenesFiltradas.map((img) => (
                <div
                  key={img.id}
                  onClick={() => toggleImagen(img.id)}
                  className={cn(
                    "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all group",
                    imagenesSeleccionadas.includes(img.id)
                      ? "border-blue-500 ring-2 ring-blue-500"
                      : "border-transparent hover:border-zinc-600",
                  )}
                >
                  <img
                    src={img.url}
                    alt={img.nombre}
                    className="w-full h-32 object-cover"
                  />
                  {imagenesSeleccionadas.includes(img.id) && (
                    <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                      <div className="bg-blue-500 rounded-full p-2">
                        <IconCheck size={24} className="text-white" />
                      </div>
                    </div>
                  )}
                  <div className="p-2 bg-zinc-800">
                    <p className="text-xs truncate font-medium">{img.nombre}</p>
                    {img.categoria && (
                      <p className="text-xs text-zinc-400 truncate">
                        {img.categoria}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
