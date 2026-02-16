import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { StockHistoriesService } from './stock-histories.service';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/stock-histories',
})
export class StockHistoriesController {
  public constructor(
    private readonly stockHistoriesService: StockHistoriesService,
  ) {}
}
