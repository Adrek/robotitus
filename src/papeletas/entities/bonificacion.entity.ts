import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Resultado } from './resultado.entity';

@Entity()
export class Bonificacion {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('text')
  documento: string;

  @Column('text')
  fechaBonificacion: string;

  @Column('text')
  vigenteHasta: string;

  @Column('int4')
  disponible: number;

  @Column('int4')
  utilizado: number;

  @ManyToOne(() => Resultado, { nullable: false })
  @JoinColumn({ name: 'resultado_id' })
  resultado: Resultado;
}
