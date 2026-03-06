import { BaseEntity } from '../../database/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'products',
})
export class ProductEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  public name!: string;

  @Column({
    name: 'uom',
    type: 'varchar',
  })
  public uom!: string;

  @Column({
    name: 'icon',
    type: 'varchar',
  })
  public icon!: string;

  @Column({
    name: 'stock',
    type: 'int',
    default: 0,
  })
  public stock!: number;
}
