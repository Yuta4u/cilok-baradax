import { BaseEntity } from '../../database/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'stock_histories',
})
export class StockHistoryEntity extends BaseEntity {
  @Column({ name: 'qty', type: 'int' })
  public qty!: number;
}
