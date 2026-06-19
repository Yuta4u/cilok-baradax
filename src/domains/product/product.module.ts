import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { StockHistoriesModule } from '../stock-history/stock-histories.module';

@Module({
  imports: [StockHistoriesModule],
  exports: [ProductService],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
