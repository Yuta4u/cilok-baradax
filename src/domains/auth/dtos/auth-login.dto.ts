import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  public email!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public password!: string;
}
