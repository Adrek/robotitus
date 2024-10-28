import { BonificacionRow } from './bonificacion-row.dto';
import { CursoRow } from './curso-row.dto';
import { PapeletaRow } from './papeleta-row.dto';

export interface SLCPData {
  administrado: string;

  dni: string;

  licencia: string;

  vigencia: string;

  estadoLicencia: string;

  puntosAcumulados: number;

  papeletas: PapeletaRow[];

  cursos: CursoRow[];

  bonificaciones: BonificacionRow[];
}
