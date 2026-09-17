import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Between, DataSource, EntityManager, ILike, In } from 'typeorm';
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
import { UserEntity } from '../user/user.entity';
import { ProductEntity } from '../product/product.entity';
import { SubmitCashFlowDto } from './dtos/submit-cashflow.dto';

@Injectable()
export class CashFlowService {
  public constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  public async getDashboard(id: string) {
    const cashFlowRepo = this.dataSource.getRepository(CashFlowEntity);

    const result = await cashFlowRepo
      .createQueryBuilder('cf')
      .leftJoin('cf.user', 'u')
      .leftJoin('cf.cashFlowItems', 'cfi')
      .select([
        'COUNT(DISTINCT cf.id) AS "totalTransaksi"',
        'COALESCE(SUM(cfi.out * cfi.price), 0) AS "totalOmset"',
      ])
      .where('u.id = :id', { id })
      .andWhere('cf.verified = :verified', { verified: 0 })
      .getRawOne();

    return {
      message: 'Successfully! get dashboard',
      statusCode: 200,
      success: true,
      data: result,
    };
  }

  public async getDetailById(id: string) {
    const cashFlowRepo = this.dataSource.getRepository(CashFlowEntity);

    const result = await cashFlowRepo.findOne({
      where: {
        id,
      },
      relations: {
        cashFlowItems: {
          product: true,
        },
        user: true,
      },
    });

    console.log('hit cuy');

    return result;
  }

  public async getHistory(sub: string) {
    const cashFlowRepo = this.dataSource.getRepository(CashFlowEntity);

    const result = await cashFlowRepo.find({
      where: {
        user: {
          id: sub,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        cashFlowItems: {
          product: true,
        },
        user: true,
      },
    });

    return result;
  }

  public async getByCabang(sub: string) {
    const userRepo = this.dataSource.getRepository(UserEntity);

    const result = await userRepo
      .createQueryBuilder('u')
      .leftJoin('u.cashFlows', 'cf')
      .select([
        'cf.createdAt as "createdAt"',
        'cf.id AS id',
        'u.name AS name',
        'cf.verified as verified',
        'COUNT(cf.id) AS totalTransaksi',
        'COALESCE(SUM(cf.in), 0) AS totalOmset',
        'MAX(u.deletedAt) AS deletedAt',
      ])
      .where('u.id = :id', {
        id: sub,
      })
      .groupBy('cf.id')
      .addGroupBy('cf.verified')
      .addGroupBy('u.name')
      .addGroupBy('cf.createdAt')
      .getRawMany();

    return {
      message: 'Successfully! get cabang today',
      statusCode: 200,
      success: true,
      data: result,
    };
  }

  public async getCabangToday() {
    const cashFlowRepo = this.dataSource.getRepository(CashFlowEntity);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const result = await cashFlowRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: {
        cashFlowItems: {
          product: true,
        },
        user: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return result;
  }

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

    if (user.permission & PERMISSION.CABANG) {
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
  public async addCashFlowTransaction(
    manager: EntityManager,
    payload: AddCashFlowDto,
  ) {
    const cashFlowRepo = manager.getRepository(CashFlowEntity);
    const cashFlowItemRepo = manager.getRepository(CashFlowItemEntity);
    const productRepo = manager.getRepository(ProductEntity);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

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
      user: {
        id: payload.id,
      },
      verified: 2,
      in: 0,
      out: 0,
    });

    await manager.save(cashFlow);

    const product = await productRepo.find();

    const cashFlowItemObj = [];

    for (const p of product) {
      const { qty, price } = payload.cashFlowItems[p.id] as never;

      cashFlowItemObj.push(
        cashFlowItemRepo.create({
          product: {
            id: p.id,
          },
          in: qty ? Number(qty) : 0,
          price: price ? price : 0,
          cashFlow: {
            id: cashFlow.id,
          },
        }),
      );

      await this.productService.updateStockTransaction(manager, {
        id: p.id,
        type: 'dec',
        quantity: qty,
        note: 'Cash flow',
      });
    }

    await manager.save(cashFlowItemObj);

    return cashFlow;
  }

  // @Transactional('dataSource')
  // public async addTransaction(manager: EntityManager, payload: AddCashFlowDto) {
  //   const cashFlowRepo = manager.getRepository(CashFlowEntity);
  //   const cashFlowItemRepo = manager.getRepository(CashFlowItemEntity);

  //   const now = new Date();
  //   const startOfDay = new Date(
  //     now.getFullYear(),
  //     now.getMonth(),
  //     now.getDate(),
  //     0,
  //     0,
  //     0,
  //     0,
  //   );
  //   const endOfDay = new Date(
  //     now.getFullYear(),
  //     now.getMonth(),
  //     now.getDate(),
  //     23,
  //     59,
  //     59,
  //     999,
  //   );

  //   const exist = await cashFlowRepo.findOne({
  //     where: {
  //       user: {
  //         id: payload.id,
  //       },
  //       createdAt: Between(startOfDay, endOfDay),
  //     },
  //   });

  //   if (exist) {
  //     throw new BadRequestException('Cash flow already exists today');
  //   }

  //   const cashFlow = cashFlowRepo.create({
  //     in: 0,
  //     out: 0,
  //     user: {
  //       id: payload.id,
  //     },
  //   });
  //   await cashFlowRepo.save(cashFlow);

  //   const cashFlowItemsObj = [];

  //   for (const [productId, { price, qty }] of Object.entries(
  //     payload.cashFlowItems,
  //   )) {
  //     await this.productService.updateStockTransaction(manager, {
  //       id: productId,
  //       type: 'dec',
  //       quantity: qty,
  //     });
  //     const cashFlowItem = cashFlowItemRepo.create({
  //       cashFlow: { id: cashFlow.id },
  //       product: { id: productId },
  //       ['in']: qty,
  //       price,
  //     });
  //     cashFlowItemsObj.push(cashFlowItem);
  //   }
  //   await cashFlowItemRepo.save(cashFlowItemsObj);

  //   // const newCashFlowItems = Object.entries(payload.cashFlowItems).map(
  //   //   ([productId, { price, qty }]) =>
  //   //     cashFlowItemRepo.create({
  //   //       cashFlow: { id: cashFlow.id },
  //   //       product: { id: productId },
  //   //       in: qty,
  //   //       price,
  //   //     }),
  //   // );

  //   return {
  //     message: 'Successfully added cash flow',
  //     success: true,
  //     statusCode: 200,
  //   };
  // }

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

  @Transactional('dataSource')
  public async submitCashFlowTransaction(
    manager: EntityManager,
    payload: SubmitCashFlowDto,
  ) {
    const cashFlowRepo = manager.getRepository(CashFlowEntity);
    const cashFlowItemRepo = manager.getRepository(CashFlowItemEntity);

    for (const [id, { qty }] of Object.entries(payload.cashFlowItems)) {
      const cashFlowItem = await cashFlowItemRepo.findOne({ where: { id } });

      if (!cashFlowItem) {
        throw new NotFoundException('Cash flow item not found');
      }

      if (qty > cashFlowItem.in) {
        throw new BadRequestException('Quantity tidak boleh lebih dari stock!');
      }

      const remains = cashFlowItem.in - qty;

      await cashFlowItemRepo.update({ id }, { out: remains });
    }

    await cashFlowRepo.update(
      { id: payload.id },
      {
        verified: 1,
        overhead: payload.pengeluaranTambahan,
        note: payload.note,
      },
    );

    return {
      message: 'Successfully confirmed cash flow report',
      statusCode: 200,
      success: true,
    };
  }

  @Transactional('dataSource')
  public async approvalCashFlowTransaction(
    manager: EntityManager,
    payload: SubmitCashFlowDto,
  ) {
    const cashFlowRepo = manager.getRepository(CashFlowEntity);
    const cashFlowItemRepo = manager.getRepository(CashFlowItemEntity);

    for (const [id, { qty }] of Object.entries(payload.cashFlowItems)) {
      const cashFlowItem = await cashFlowItemRepo.findOne({
        where: { id },
        relations: {
          product: true,
        },
      });

      if (!cashFlowItem) {
        throw new NotFoundException('Cash flow item not found');
      }

      if (qty > cashFlowItem.in) {
        throw new BadRequestException('Quantity tidak boleh lebih dari stock!');
      }

      const out = cashFlowItem.in - qty;
      const totalPrice = out * cashFlowItem.price;

      await cashFlowItemRepo.update({ id }, { out, totalPrice });

      const remainingStock = cashFlowItem.in - qty;

      if (remainingStock) {
        await this.productService.updateStockTransaction(manager, {
          id: cashFlowItem.product.id,
          type: 'inc',
          quantity: qty,
          note: 'in, stock sisa',
        });
      }
    }

    await cashFlowRepo.update(
      { id: payload.id },
      {
        verified: 0,
        overhead: payload.pengeluaranTambahan,
        note: payload.note,
      },
    );

    return {
      message: 'Successfully confirmed cash flow report',
      statusCode: 200,
      success: true,
    };
  }
}
