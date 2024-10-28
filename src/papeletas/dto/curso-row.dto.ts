import { DetalleCursoRow } from './detalle-curso-row.dto';

export interface CursoRow {
  entidad: string;
  capacitacion: string;
  certificado: string;
  fecha: string;
  papeleta: string;
  puntos: number;
  detalle: DetalleCursoRow[];
}
