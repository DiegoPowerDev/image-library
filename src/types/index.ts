// types/index.ts
import { Timestamp } from "firebase/firestore";

export type Fecha = Date | Timestamp | string;

export interface Historial {
  id: number;
  titulo: string;
  descripcion: string;
  url: string;
  autor: string;
  fechaModificacion: Fecha;
}

export interface Image {
  id: number;
  nombre: string;
  url: string;
  autor: string;
  fechaModificacion: Fecha;
  fechaCreacion: Fecha;
  categoria: string;
  estado: string;
  campaña: string;
  descripcion: string;
  historial: Historial[];
}

export interface FormData {
  nombre: string;
  imagen: string;
  url: string;
  descripcion: string;
  autor: string;
  categoria: string;
  campaña: string;
}
