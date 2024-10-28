import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bonificacion } from './bonificacion.entity';
import { Curso } from './curso.entity';
import { Infraccion } from './infraccion.entity';
import { Papeleta } from './papeleta.entity';

@Entity()
export class Resultado {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text')
  administrado: string;

  @Column('text')
  dni: string;

  @Column('text')
  licencia: string;

  @Column('text')
  vigencia: string;

  @Column('text')
  estadoLicencia: string;

  @Column('int4')
  puntosAcumulados: number;

  @ManyToOne(() => Infraccion, { nullable: false })
  @JoinColumn({ name: 'infraccion_id' })
  infraccion: Infraccion;

  @OneToMany(() => Papeleta, (papeleta) => papeleta.resultado)
  papeletas: Papeleta[];

  @OneToMany(() => Curso, (curso) => curso.resultado)
  cursos: Curso[];

  @OneToMany(() => Bonificacion, (bonificacion) => bonificacion.resultado)
  bonificaciones: Bonificacion[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt?: Date;
}
