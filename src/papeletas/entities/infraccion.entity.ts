import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Mistake } from './mistake.entity';
import { Resultado } from './resultado.entity';
import { TipoDocIdentidadInfraccion } from './tipo-doc-identidad-infraccion.entity';

@Entity()
export class Infraccion {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('text')
  valorBusqueda: string;

  @Column('text', {
    default: '',
    nullable: true,
  })
  nombreCompleto: string;

  @Column('int4')
  totalPuntos: number;

  @Column('boolean', {
    default: false,
  })
  procesado: boolean;

  @Column('boolean', {
    default: false,
  })
  exitoso: boolean;

  @ManyToOne(() => TipoDocIdentidadInfraccion, { nullable: false })
  @JoinColumn({ name: 'tipo_doc_identidad_id' })
  tipoDocIdentidadInfracion: TipoDocIdentidadInfraccion;

  @OneToMany(() => Resultado, (resultado) => resultado.infraccion)
  resultados: Resultado[];

  @OneToMany(() => Mistake, (mistake) => mistake.infraccion)
  mistakes: Mistake[];
}
