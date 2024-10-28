import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Infraccion } from './infraccion.entity';

@Entity()
export class TipoDocIdentidadInfraccion {
  @PrimaryColumn('int')
  id: number;

  @Column('text')
  nombre: string;

  @Column('int4')
  slcpTipoId: number;

  @OneToMany(
    () => Infraccion,
    (infraccion) => infraccion.tipoDocIdentidadInfracion,
  )
  infracciones: Infraccion[];
}
