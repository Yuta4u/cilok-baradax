import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StockHistoriesService } from './stock-histories.service';
import { startTransaction } from '../../decorators/database.decorator';
import { CreateStockHistoryDto } from './dtos/create.dto';
import { QueryStockHistoryDto } from './dtos/query-stock-history.dto';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/stock-histories',
})
export class StockHistoriesController {
  public constructor(
    private readonly stockHistoriesService: StockHistoriesService,
  ) {}
  @Get()
  findAll(@Query() query: QueryStockHistoryDto) {
    return this.stockHistoriesService.findAll(query);
  }

  @Post()
  public async create(@Body() payload: CreateStockHistoryDto) {
    const res = await startTransaction(
      this.stockHistoriesService,
      'createTransaction',
      payload,
    );
    return res;
  }
}
