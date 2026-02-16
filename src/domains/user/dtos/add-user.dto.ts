import { PERMISSION } from '@/constant';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

const enumPermissions = Object.keys(PERMISSION) as (keyof typeof PERMISSION)[];

export class CreateUserRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public name!: string;

  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  public email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public password!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(enumPermissions, { each: true })
  public permission!: typeof enumPermissions;
}
