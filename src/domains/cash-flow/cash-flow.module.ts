import { Module } from '@nestjs/common';
import { CashFlowController } from './cash-flow.controller';
import { CashFlowService } from './cash-flow.service';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [UserModule, ProductModule],
  controllers: [CashFlowController],
  providers: [CashFlowService],
})
export default class CashFlowModule {}
