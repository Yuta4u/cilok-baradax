import { Module } from '@nestjs/common';

import { ProductModule } from '../product/product.module';
import { CashFlowOverheadController } from './cash-flow-overhead.controller';
import { CashFlowOverheadService } from './cash-flow-overhead.service';

@Module({
  controllers: [CashFlowOverheadController],
  providers: [CashFlowOverheadService],
})
export class CashFlowOverheadModule {}
