import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StockHistoriesService } from './stock-histories.service';
import { startTransaction } from '../../decorators/database.decorator';
import { CreateStockHistoryDto } from './dtos/create.dto';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/stock-histories',
})
export class StockHistoriesController {
  public constructor(
    private readonly stockHistoriesService: StockHistoriesService,
  ) {}

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
