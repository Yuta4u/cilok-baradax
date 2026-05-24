import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Between, DataSource, EntityManager, In } from 'typeorm';
import { Transactional } from '../../decorators/database.decorator';
import { AddCashFlowDto } from './dtos/create.dto';
import { CashFlowEntity } from './cash-flow.entity';
import { UserService } from '../user/user.service';
import { BaseParams } from '../../database/base.entity';
import { PERMISSION } from '../../constant';
import { CashFlowItemEntity } from '../cash-flow-item/cash-flow-item.entity';
import { AddReportDto } from './dtos/add-report.dto';
import { ProductService } from '../product/product.service';
import { ConfirmReportDto } from './dtos/confirmation.dto';

@Injectable()
export class CashFlowService {
  public constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  public async getAll(query: BaseParams, sub: string) {
    const cashFlowRepo = this.dataSource.getRepository(CashFlowEntity); // tidak perlu await

    const user = await this.userService.findOne(sub);
    if (!user) throw new BadRequestException('User not found');

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const qb = cashFlowRepo
      .createQueryBuilder('cf')
      .leftJoin('cf.user', 'u')
      .select([
        'cf.id as id',
        'cf.createdAt as "createdAt"',
        'cf.in as in',
        'cf.out as out',
        'cf.note as note',
        'u.name as name',
        'cf.verified as verified',
      ]);

    if (user.permission & PERMISSION.KARYAWAN) {
      qb.andWhere('u.id = :id', { id: sub });
    }

    const isAdminOrSuper =
      user.permission & PERMISSION.ADMIN ||
      user.permission & PERMISSION.SUPER_USER;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalIn, totalOut, todayIn, todayOut, total] = await Promise.all([
      cashFlowRepo
        .createQueryBuilder('cf')
        .select('COALESCE(SUM(cf.in), 0) as "totalIn"')
        .where('cf.verified = :verified', { verified: 2 })
        .getRawOne(),
      cashFlowRepo
        .createQueryBuilder('cf')
        .select('COALESCE(SUM(cf.out), 0) as "totalOut"')
        .where('cf.verified = :verified', { verified: 2 })
        .getRawOne(),
      cashFlowRepo
        .createQueryBuilder('cf')
        .select('COALESCE(SUM(cf.in), 0) as "todayIn"')
        .where('cf.verified = :verified', { verified: 2 })
        .andWhere('cf.createdAt >= :date', { date: startOfToday })
        .getRawOne(),
      cashFlowRepo
        .createQueryBuilder('cf')
        .select('COALESCE(SUM(cf.out), 0) as "todayOut"')
        .where('cf.verified = :verified', { verified: 2 })
        .andWhere('cf.createdAt >= :date', { date: startOfToday })
        .getRawOne(),
      cashFlowRepo
        .createQueryBuilder('cf')
        .select('COALESCE(SUM(cf.in), 0) - COALESCE(SUM(cf.out), 0) as total')
        .where('cf.verified = :verified', { verified: 2 })
        .getRawOne(),
    ]);

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
    console.log(todayIn, 'test');

    return {
      message: 'Successfully! get cash flow',
      statusCode: 200,
      success: true,
      data: result,
      ...(isAdminOrSuper && {
        ...totalIn,
        ...totalOut,
        ...todayIn,
        ...todayOut,
        ...total,
      }),
      metadata: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  public async getById(id: string) {
    const cashFlowRepo = this.dataSource.getRepository(CashFlowEntity);

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const data = await cashFlowRepo.findOne({
      relations: {
        user: true,
        cashFlowItems: {
          product: true,
        },
      },
      where: {
        user: {
          id,
        },
        createdAt: Between(startOfDay, endOfDay),
        verified: 0,
      },
    });

    return {
      message: 'Successfully! get cash flow',
      statusCode: 200,
      success: true,
      data,
    };
  }

  public async getView(id: string) {
    const cashFlowRepo = this.dataSource.getRepository(CashFlowEntity);

    const data = await cashFlowRepo.findOne({
      relations: {
        user: true,
        cashFlowItems: {
          product: true,
        },
      },
      where: {
        id,
      },
    });

    return {
      message: 'Successfully! get cash flow view',
      statusCode: 200,
      success: true,
      data,
    };
  }

  @Transactional('dataSource')
  public async addTransaction(manager: EntityManager, payload: AddCashFlowDto) {
    const cashFlowRepo = manager.getRepository(CashFlowEntity);
    const cashFlowItemRepo = manager.getRepository(CashFlowItemEntity);

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const exist = await cashFlowRepo.findOne({
      where: {
        user: {
          id: payload.id,
        },
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    if (exist) {
      throw new BadRequestException('Cash flow already exists today');
    }

    const cashFlow = cashFlowRepo.create({
      in: 0,
      out: 0,
      user: {
        id: payload.id,
      },
    });
    await cashFlowRepo.save(cashFlow);

    const cashFlowItemsObj = [];

    for (const [productId, { price, qty }] of Object.entries(
      payload.cashFlowItems,
    )) {
      await this.productService.updateStockTransaction(manager, {
        id: productId,
        type: 'dec',
        quantity: qty,
      });
      const cashFlowItem = cashFlowItemRepo.create({
        cashFlow: { id: cashFlow.id },
        product: { id: productId },
        ['in']: qty,
        price,
      });
      cashFlowItemsObj.push(cashFlowItem);
    }
    await cashFlowItemRepo.save(cashFlowItemsObj);

    // const newCashFlowItems = Object.entries(payload.cashFlowItems).map(
    //   ([productId, { price, qty }]) =>
    //     cashFlowItemRepo.create({
    //       cashFlow: { id: cashFlow.id },
    //       product: { id: productId },
    //       in: qty,
    //       price,
    //     }),
    // );

    return {
      message: 'Successfully added cash flow',
      success: true,
      statusCode: 200,
    };
  }

  @Transactional('dataSource')
  public async addReportTransaction(
    manager: EntityManager,
    payload: AddReportDto,
  ) {
    const cashFlowRepo = manager.getRepository(CashFlowEntity);
    const cashFlowItemRepo = manager.getRepository(CashFlowItemEntity);

    const cashFlowItem = await cashFlowItemRepo.find({
      where: {
        id: In(Object.keys(payload.quantities)),
      },
      relations: {
        cashFlow: true,
      },
    });

    if (!cashFlowItem.length) {
      throw new BadRequestException('Cash flow item not found');
    }

    for (const item of cashFlowItem) {
      if (item.in < Number(payload.quantities[item.id])) {
        throw new BadRequestException('Quantity tidak boleh lebih dari stock!');
      }
      await cashFlowItemRepo.update(
        {
          id: item.id,
        },
        {
          out: Number(payload.quantities[item.id]),
        },
      );
    }

    const totalIn = cashFlowItem.reduce(
      (acc, item) => acc + Number(payload.quantities[item.id]) * item.price,
      0,
    );

    await cashFlowRepo.update(
      {
        id: cashFlowItem[0].cashFlow.id,
      },
      {
        note: payload.note,
        out: Number(payload.out),
        in: totalIn,
        verified: 1,
      },
    );

    return {
      message: 'Successfully added cash flow',
      success: true,
      statusCode: 200,
    };
  }

  @Transactional('dataSource')
  public async confirmReportTransaction(
    manager: EntityManager,
    payload: ConfirmReportDto,
  ) {
    const cashFlowRepo = manager.getRepository(CashFlowEntity);
    const cashFlowItemRepo = manager.getRepository(CashFlowItemEntity);

    const quantityIds = Object.keys(payload.quantities);

    const cashFlowItems = await cashFlowItemRepo.find({
      where: {
        id: In(quantityIds),
      },
      relations: {
        cashFlow: true,
      },
    });

    if (cashFlowItems.length !== quantityIds.length) {
      throw new NotFoundException('Some cash flow items not found');
    }

    // Validasi: out tidak boleh melebihi in
    const invalidItems = cashFlowItems.filter(
      (item) => Number(payload.quantities[item.id]) > Number(item.in),
    );

    if (invalidItems.length > 0) {
      throw new BadRequestException(
        `Out quantity exceeds in quantity for items: ${invalidItems.map((i) => i.id).join(', ')}`,
      );
    }

    const totalOut = cashFlowItems.reduce(
      (acc, item) =>
        acc + cashFlowItems[0].price * Number(payload.quantities[item.id]),
      0,
    );

    await Promise.all(
      Object.entries(payload.quantities).map(([id, quantity]) => {
        return cashFlowItemRepo.update({ id }, { out: Number(quantity) });
      }),
    );

    await cashFlowRepo.update(
      { id: payload.id },
      {
        verified: 2,
        out: totalOut,
      },
    );

    return {
      message: 'Successfully confirmed cash flow report',
      success: true,
      statusCode: 200,
    };
  }
}
