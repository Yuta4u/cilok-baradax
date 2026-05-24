import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddReportDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public note!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public out!: string;

  @ApiProperty()
  @IsNotEmpty()
  public quantities!: Record<string, string>;
}
