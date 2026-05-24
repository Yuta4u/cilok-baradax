import { BaseEntity } from '../../database/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { CashFlowItemEntity } from '../cash-flow-item/cash-flow-item.entity';

@Entity({
  name: 'products',
})
export class ProductEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 255, unique: true })
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

  @Column({
    name: 'minimal_stock',
    type: 'int',
    default: 0,
  })
  public minimalStock!: number;

  @Column({
    name: 'price',
    type: 'int',
    default: 0,
  })
  public price!: number;

  @OneToMany(() => CashFlowItemEntity, (item) => item.product)
  public cashFlowItems!: CashFlowItemEntity[];
}
