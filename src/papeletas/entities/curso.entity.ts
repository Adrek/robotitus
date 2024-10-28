import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DetalleCurso } from './detalle_curso.entity';
import { Resultado } from './resultado.entity';

@Entity()
export class Curso {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('text')
  entidad: string;

  @Column('text')
  capacitacion: string;

  @Column('text')
  certificado: string;

  @Column('text')
  fecha: string;

  @Column('text')
  papeleta: string;

  @Column('int4')
  puntos: number;

  @ManyToOne(() => Resultado, { nullable: false })
  @JoinColumn({ name: 'resultado_id' })
  resultado: Resultado;

  @OneToMany(() => DetalleCurso, (detalle) => detalle.curso)
  detalles: DetalleCurso[];
}
