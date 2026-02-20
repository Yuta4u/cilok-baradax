import { BaseParams } from '../../database/base.entity';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StockHistoryEntity } from './stock-histories.entity';

@Injectable()
export class StockHistoriesService {
  public constructor(private readonly dataSource: DataSource) {}

  public async getRepository(query: BaseParams) {
    const repo = this.dataSource.getRepository(StockHistoryEntity);
    return repo.find();
  }
}
