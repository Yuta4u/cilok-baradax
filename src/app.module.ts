import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './domains/user/user.module';
import { DatabaseModule } from './database/database.module';
import { ProductModule } from './domains/product/product.module';
import { StockHistoriesModule } from './domains/stock-histories/stock-histories.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    UserModule,
    ProductModule,
    StockHistoriesModule,
  ],
})
export class AppModule {}
