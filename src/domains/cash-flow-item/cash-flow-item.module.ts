import { Module } from '@nestjs/common';
import { CashFlowItemService } from './cash-flow-item.service';
import { CashFlowItemController } from './cash-flow-item.controller';

@Module({
  controllers: [CashFlowItemController],
  providers: [CashFlowItemService],
})
export default class CashFlowItemModule {}
