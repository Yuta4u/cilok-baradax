import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddCashFlowDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public amount!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public type!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public note!: string;
}
