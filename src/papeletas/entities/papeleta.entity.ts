import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Resultado } from './resultado.entity';

@Entity()
export class Papeleta {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('text')
  entidad: string;

  @Column('text')
  papeleta: string;

  @Column('text')
  fecha: string;

  @Column('text')
  fechaFirme: string;

  @Column('text')
  falta: string;

  @Column('text')
  resolucion: string;

  @Column('int4')
  puntosFirmes: number;

  @Column('int4')
  puntosProceso: number;

  @ManyToOne(() => Resultado, { nullable: false })
  @JoinColumn({ name: 'resultado_id' })
  resultado: Resultado;
}
