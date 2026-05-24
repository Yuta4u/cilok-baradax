import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateStock {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public id!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public quantity!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public type!: 'inc' | 'dec';
}
