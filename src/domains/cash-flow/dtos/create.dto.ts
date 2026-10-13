import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddCashFlowDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public id!: string;

  @ApiProperty()
  @IsNotEmpty()
  public cashFlowItems!: Record<string, { qty: number; price: number }>;
}
