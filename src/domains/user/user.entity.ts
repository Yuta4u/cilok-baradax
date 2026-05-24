import { BaseEntity } from '../../database/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { CashFlowEntity } from '../cash-flow/cash-flow.entity';

@Entity({
  name: 'users',
})
export class UserEntity extends BaseEntity {
  // name
  @Column({ name: 'name', type: 'varchar', length: 255 })
  public name!: string;

  // email
  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  public email!: string;

  //password
  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
  })
  public password!: string;

  @Column({
    name: 'stock_cilok',
    type: 'int',
    default: 0,
  })
  public stockCilok!: number;

  //permission
  @Column({
    name: 'permission',
    type: 'bigint',
    default: 0,
    transformer: {
      from: (v) => +v,
      to: (v) => v + '',
    },
  })
  public permission!: number;

  @OneToMany(() => CashFlowEntity, (cashFlow) => cashFlow.user)
  public cashFlows!: CashFlowEntity[];
}
