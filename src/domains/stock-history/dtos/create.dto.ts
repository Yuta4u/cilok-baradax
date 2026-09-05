import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateStockHistoryDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  public productId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public type!: 'in' | 'out';

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public qty!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public note!: string;
}
