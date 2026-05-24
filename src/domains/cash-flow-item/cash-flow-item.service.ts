import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CashFlowItemService {
  public constructor(private readonly dataSource: DataSource) {}
}
