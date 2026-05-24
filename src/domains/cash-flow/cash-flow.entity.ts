import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { UserEntity } from '../user/user.entity';
import { CashFlowItemEntity } from '../cash-flow-item/cash-flow-item.entity';

// cash-flow.entity.ts
@Entity({
  name: 'cash_flows',
})
export class CashFlowEntity extends BaseEntity {
  @Column({
    name: 'in',
    type: 'int',
  })
  public in!: number;

  @Column({
    name: 'out',
    type: 'int',
  })
  public out!: number;

  @Column({
    name: 'note',
    type: 'text',
    nullable: true,
  })
  public note?: string;

  @Column({
    name: 'verified',
    type: 'int',
    default: 0,
  })
  public verified!: 0 | 1 | 2;

  @ManyToOne(() => UserEntity, (user) => user.cashFlows)
  @JoinColumn({ name: 'user_id' })
  public user!: UserEntity;

  @OneToMany(() => CashFlowItemEntity, (item) => item.cashFlow, {
    cascade: true,
  })
  public cashFlowItems!: CashFlowItemEntity[];
}
