import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Transactional } from '../../decorators/database.decorator';
import { AddCashFlowDto } from './dtos/create.dto';
import { CashFlowEntity } from './cash-flow.entity';
import { UserService } from '../user/user.service';
import { BaseParams } from '../../database/base.entity';
import { PERMISSION } from '../../constant';

@Injectable()
export class CashFlowService {
  public constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  public async getAll(query: BaseParams, sub: string) {
    const cashFlowRepo = this.dataSource.getRepository(CashFlowEntity); // tidak perlu await

    const user = await this.userService.findOne(sub);
    if (!user) throw new BadRequestException('User not found');

    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, parseInt(query.limit) || 10);

    const qb = cashFlowRepo
      .createQueryBuilder('cf')
      .leftJoin('cf.user', 'u')
      .select([
        'cf.id as id',
        'cf.createdAt as "createdAt"',
        'cf.amount as amount',
        'cf.type as type',
        'cf.note as note',
        'u.name as name',
      ]);

    if (user.permission & PERMISSION.KARYAWAN) {
      qb.andWhere('u.id = :id', { id: sub });
    }

    type CashFlowType = 'INCOME' | 'EXPENSE';

    const validTypes: CashFlowType[] = ['INCOME', 'EXPENSE'];

    if (query.type && validTypes.includes(query.type as CashFlowType)) {
      qb.andWhere('cf.type = :type', { type: query.type });
    }

    let totalIncome = 0;
    let totalExpense = 0;
    let todayIncome = 0;
    let todayExpense = 0;

    const isAdminOrSuper =
      user.permission & PERMISSION.ADMIN ||
      user.permission & PERMISSION.SUPER_USER;

    if (isAdminOrSuper) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [income, expense, incomeResult, expenseResult] = await Promise.all([
        cashFlowRepo
          .createQueryBuilder('cf')
          .select('COALESCE(SUM(cf.amount), 0) as "totalAmount"') // COALESCE agar tidak null
          .where('cf.type = :type', { type: 'INCOME' })
          .getRawOne(), // getRawOne, bukan await langsung
        cashFlowRepo
          .createQueryBuilder('cf')
          .select('COALESCE(SUM(cf.amount), 0) as "totalAmount"')
          .where('cf.type = :type', { type: 'EXPENSE' })
          .getRawOne(),
        cashFlowRepo
          .createQueryBuilder('cf')
          .select('COALESCE(SUM(cf.amount), 0) as "todayAmount"') // COALESCE agar tidak null
          .where('cf.type = :type', { type: 'INCOME' })
          .andWhere('cf.createdAt >= :date', { date: startOfToday })
          .getRawOne(), // getRawOne, bukan await langsung
        cashFlowRepo
          .createQueryBuilder('cf')
          .select('COALESCE(SUM(cf.amount), 0) as "todayAmount"')
          .where('cf.type = :type', { type: 'EXPENSE' })
          .andWhere('cf.createdAt >= :date', { date: startOfToday })
          .getRawOne(),
      ]);

      totalIncome = parseFloat(income.totalAmount) || 0;
      totalExpense = parseFloat(expense.totalAmount) || 0;
      todayIncome = parseFloat(incomeResult.todayAmount) || 0;
      todayExpense = parseFloat(expenseResult.todayAmount) || 0;
    }

    const qbClone = qb.clone();
    const [result, totalItems] = await Promise.all([
      qb
        .offset((page - 1) * limit)
        .limit(limit)
        .orderBy('cf.createdAt', 'DESC')
        .getRawMany(),
      qbClone.getCount(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      message: 'Successfully! get cash flow',
      statusCode: 200,
      success: true,
      data: result,
      ...(isAdminOrSuper && {
        totalIncome,
        totalExpense,
        todayIncome,
        todayExpense,
      }),
      metadata: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  @Transactional('dataSource')
  public async addTransaction(
    manager: EntityManager,
    payload: AddCashFlowDto,
    sub: string,
  ) {
    const cashFlowRepo = manager.getRepository(CashFlowEntity);

    if (!payload.amount) {
      throw new BadRequestException('Amount is required');
    }

    const cashFlow = cashFlowRepo.create({
      ...payload,
      user: {
        id: sub,
      },
    });
    await cashFlowRepo.save(cashFlow);

    return {
      message: 'Successfully! add cash flow',
      success: true,
      statusCode: 200,
    };
  }
}
