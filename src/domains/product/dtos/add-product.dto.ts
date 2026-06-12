import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public name!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public minimalStock!: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public price!: number;
}
