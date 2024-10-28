import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Curso } from './curso.entity';

@Entity()
export class DetalleCurso {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('text')
  entidad: string;

  @Column('text')
  papeleta: string;

  @Column('text')
  fechaInfraccion: string;

  @Column('text')
  fechaFirme: string;

  @Column('text')
  falta: string;

  @Column('int4')
  puntos: number;

  @ManyToOne(() => Curso, { nullable: false })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso;
}
