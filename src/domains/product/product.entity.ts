import { BaseEntity } from '../../database/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'products',
})
export class ProductEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  public name!: string;

  @Column({
    name: 'stock',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  public stock!: number;
}
