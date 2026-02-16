import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  public id!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public name?: string;

  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsOptional()
  public email?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public password?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(['SUPER_USER', 'ADMIN', 'KARYAWAN'], { each: true })
  public permission?: ('SUPER_USER' | 'ADMIN' | 'KARYAWAN')[];
}
