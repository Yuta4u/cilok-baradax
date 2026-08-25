import { Module } from '@nestjs/common';
import { CashFlowItemService } from './cash-flow-item.service';
import { CashFlowItemController } from './cash-flow-item.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ProductModule],
  controllers: [CashFlowItemController],
  providers: [CashFlowItemService],
})
export class CashFlowItemModule {}
