import { BaseEntity } from '../../database/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from '../product/product.entity';

@Entity({
  name: 'stock_histories',
})
export class StockHistoryEntity extends BaseEntity {
  @Column({ name: 'qty', type: 'int' })
  public qty!: number;

  @Column({ name: 'type', type: 'enum', enum: ['in', 'out'] })
  public type!: 'in' | 'out';

  @Column({ name: 'note', type: 'text' })
  public note!: string;

  @ManyToOne(() => ProductEntity, (product) => product.id)
  @JoinColumn({ name: 'product_id' })
  public product!: ProductEntity;
}
