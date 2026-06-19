import { Module } from '@nestjs/common';
import { StockHistoriesController } from './stock-histories.controller';
import { StockHistoriesService } from './stock-histories.service';

@Module({
  controllers: [StockHistoriesController],
  providers: [StockHistoriesService],
  exports: [StockHistoriesService],
})
export class StockHistoriesModule {}
