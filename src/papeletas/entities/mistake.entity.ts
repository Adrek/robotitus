import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Infraccion } from './infraccion.entity';

@Entity()
export class Mistake {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('text')
  descripcion: string;

  @ManyToOne(() => Infraccion, { nullable: false })
  @JoinColumn({ name: 'infraccion_id' })
  infraccion: Infraccion;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt?: Date;
}
