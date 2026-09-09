import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsString, IsUUID } from 'class-validator';

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
  @IsString()
  note!: string;
}
