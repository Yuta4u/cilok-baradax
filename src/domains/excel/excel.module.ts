import { Global, Module } from '@nestjs/common';
import { excelProviders } from './excel.providers';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';

@Global()
@Module({
  exports: [ExcelService],
  providers: [...excelProviders, ExcelService],
  controllers: [ExcelController],
})
export class ExcelModule {}
