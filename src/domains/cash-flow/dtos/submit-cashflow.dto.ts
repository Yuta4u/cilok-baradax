import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class Expenses {
  @ApiProperty()
  @IsString()
  note!: string;

  @ApiProperty()
  @IsNumber()
  amount!: number;
}

export class SubmitCashFlowDto {
  @ApiProperty()
  @IsUUID('all')
  id!: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        qty: {
          type: 'number',
        },
      },
      required: ['qty'],
    },
  })
  @IsObject()
  cashFlowItems!: Record<string, { qty: number }>;

  @ApiProperty()
  @IsNumber()
  pengeluaranTambahan!: number;

  @ApiProperty()
  @IsNumber()
  qris!: number;

  @ApiProperty()
  @IsNumber()
  gofood!: number;

  @ApiProperty()
  @IsNumber()
  grabfood!: number;

  @ApiProperty()
  @IsNumber()
  shopeefood!: number;

  @ApiProperty()
  @IsString()
  note!: string;

  @ApiProperty({
    type: [Expenses],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Expenses)
  expenses!: Expenses[];
}
