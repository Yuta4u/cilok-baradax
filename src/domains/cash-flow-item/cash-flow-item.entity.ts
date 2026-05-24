import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { CashFlowEntity } from '../cash-flow/cash-flow.entity';
import { ProductEntity } from '../product/product.entity';

// cash-flow-item.entity.ts
@Entity({
  name: 'cash_flow_items',
})
export class CashFlowItemEntity extends BaseEntity {
  @Column({
    name: 'in',
    type: 'int',
    default: 0,
  })
  public in!: number;

  @Column({
    name: 'out',
    type: 'int',
    nullable: true,
    default: 0,
  })
  public out?: number;

  @Column({
    name: 'price',
    type: 'int',
    default: 0,
  })
  public price!: number;

  @Column({
    name: 'total_price',
    type: 'int',
    default: 0,
  })
  public totalPrice!: number;

  @ManyToOne(() => ProductEntity, (product) => product.cashFlowItems)
  @JoinColumn({ name: 'product_id' })
  public product!: ProductEntity;

  @ManyToOne(() => CashFlowEntity, (cashFlow) => cashFlow.cashFlowItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cash_flow_id' })
  public cashFlow!: CashFlowEntity;
}
