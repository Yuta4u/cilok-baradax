import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { CashFlowEntity } from '../cash-flow/cash-flow.entity';

// cash-flow-item.entity.ts
@Entity({
  name: 'cash_flow_overheads',
})
export class CashFlowOverheadEntity extends BaseEntity {
  @Column({
    name: 'note',
    type: 'text',
  })
  public note?: string;

  @Column({
    name: 'amount',
    type: 'int',
    default: 0,
  })
  public amount!: number;

  @ManyToOne(() => CashFlowEntity, (cashFlow) => cashFlow.cashFlowOverheads, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cash_flow_overhead_id' })
  public cashFlow!: CashFlowEntity;
}
