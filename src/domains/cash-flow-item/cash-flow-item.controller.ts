import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { startTransaction } from '../../decorators/database.decorator';
import { CashFlowItemService } from './cash-flow-item.service';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/cash-flow-item',
})
export class CashFlowItemController {
  public constructor(
    private readonly cashFlowItemService: CashFlowItemService,
  ) {}

  @Put('/stock')
  public async updateStock(@Body() payload: Record<string, number>) {
    const res = await startTransaction(
      this.cashFlowItemService,
      'updateStockTransaction',
      payload,
    );
    return res;
  }
}
