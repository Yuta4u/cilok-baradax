import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './domains/user/user.module';
import { DatabaseModule } from './database/database.module';
import { ProductModule } from './domains/product/product.module';
import { StockHistoriesModule } from './domains/stock-histories/stock-histories.module';
import { AuthModule } from './domains/auth/auth.module';
import CashFlowModule from './domains/cash-flows/cash-flow.module';
import { IngredientModule } from './domains/ingredients/ingredient.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UserModule,
    ProductModule,
    IngredientModule,
    StockHistoriesModule,
    CashFlowModule,
  ],
})
export class AppModule {}
