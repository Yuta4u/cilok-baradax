import { BaseParams } from '../../database/base.entity';
import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, EntityManager } from 'typeorm';
import { StockHistoryEntity } from './stock-histories.entity';
import { Transactional } from '../../decorators/database.decorator';
import { CreateStockHistoryDto } from './dtos/create.dto';
import { QueryStockHistoryDto } from './dtos/query-stock-history.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 15;

@Injectable()
export class StockHistoriesService {
  public constructor(private readonly dataSource: DataSource) {}

  public async getRepository(query: BaseParams) {
    const repo = this.dataSource.getRepository(StockHistoryEntity);
    return repo.find();
  }

  async findAll(query: QueryStockHistoryDto) {
    const stockHistoryRepo = this.dataSource.getRepository(StockHistoryEntity);
    const page = Math.max(Number(query.page) || DEFAULT_PAGE, 1);
    const limit = Math.max(Number(query.limit) || DEFAULT_LIMIT, 1);
    const type = query.type ?? 'all';
    const search = query.search?.trim();

    const qb = stockHistoryRepo
      .createQueryBuilder('stockHistory')
      .leftJoinAndSelect('stockHistory.product', 'product')
      .orderBy('stockHistory.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (type === 'in') {
      qb.andWhere('stockHistory.type = :type', { type: 'in' });
    } else if (type === 'out') {
      qb.andWhere('stockHistory.type = :type', { type: 'out' });
    }

    if (search) {
      qb.andWhere(
        new Brackets((qb2) => {
          qb2
            .where('product.name ILIKE :search', { search: `%${search}%` })
            .orWhere('stockHistory.note ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((item) => this.toResponse(item)),
      meta: {
        page,
        limit,
        total,
        hasNextPage: page * limit < total,
      },
    };
  }

  private toResponse(item: StockHistoryEntity) {
    return {
      id: item.id,
      productName: item.product?.name ?? '-',
      uom: item.product?.uom ?? '',
      qty: Math.abs(item.qty),
      type: item.type,
      note: item.note,
      createdAt: item.createdAt,
    };
  }

  @Transactional('dataSource')
  public async createTransaction(
    manager: EntityManager,
    payload: CreateStockHistoryDto,
  ) {
    const stockHistoryRepo = manager.getRepository(StockHistoryEntity);

    const stockHistory = stockHistoryRepo.create({
      ...payload,
      product: {
        id: payload.productId,
      },
    });
    return stockHistoryRepo.save(stockHistory);
  }
}
