import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ConfirmReportDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public id!: string;

  @ApiProperty()
  @IsNotEmpty()
  public quantities!: Record<string, string>;
}
