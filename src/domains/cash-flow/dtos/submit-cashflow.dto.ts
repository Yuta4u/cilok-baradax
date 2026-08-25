import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsUUID } from 'class-validator';

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
}
