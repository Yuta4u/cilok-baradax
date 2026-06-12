import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './domains/user/user.module';
import { DatabaseModule } from './database/database.module';
import { ProductModule } from './domains/product/product.module';
import { StockHistoriesModule } from './domains/stock-history/stock-histories.module';
import { AuthModule } from './domains/auth/auth.module';
import CashFlowModule from './domains/cash-flow/cash-flow.module';
import CashFlowItemModule from './domains/cash-flow-item/cash-flow-item.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UserModule,
    ProductModule,
    StockHistoriesModule,
    CashFlowModule,
    CashFlowItemModule,
  ],
})
export class AppModule {}
