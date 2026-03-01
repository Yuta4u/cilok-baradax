import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { UserEntity } from '../user/user.entity';

@Entity({
  name: 'cash_flows',
})
export class CashFlowEntity extends BaseEntity {
  @Column({
    name: 'amount',
    type: 'int',
  })
  public amount!: number;

  @Column({
    name: 'type',
    type: 'enum',
    enum: ['INCOME', 'EXPENSE'],
  })
  public type!: string;

  @Column({
    name: 'note',
    type: 'text',
  })
  public note!: string;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => UserEntity, (user) => user.id)
  public user!: UserEntity;
}
