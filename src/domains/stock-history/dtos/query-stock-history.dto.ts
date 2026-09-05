// src/modules/stock-history/dto/query-stock-history.dto.ts
import { IsIn, IsOptional, IsNumberString, IsString } from 'class-validator';

export class QueryStockHistoryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['in', 'out', 'all'])
  type?: 'in' | 'out' | 'all';
}
