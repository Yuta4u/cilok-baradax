import { BaseParams } from '../../database/base.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { StockHistoryEntity } from './stock-histories.entity';
import { Transactional } from '../../decorators/database.decorator';
import { CreateStockHistoryDto } from './dtos/create.dto';

@Injectable()
export class StockHistoriesService {
  public constructor(private readonly dataSource: DataSource) {}

  public async getRepository(query: BaseParams) {
    const repo = this.dataSource.getRepository(StockHistoryEntity);
    return repo.find();
  }

  @Transactional('dataSource')
  public async createTransaction(
    manager: EntityManager,
    payload: CreateStockHistoryDto,
  ) {
    const stockHistoryRepo = manager.getRepository(StockHistoryEntity);

    const stockHistory = stockHistoryRepo.create(payload);
    return stockHistoryRepo.save(stockHistory);
  }
}
