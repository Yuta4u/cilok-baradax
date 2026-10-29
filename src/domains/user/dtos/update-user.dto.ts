import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  public id!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public name?: string;
}
