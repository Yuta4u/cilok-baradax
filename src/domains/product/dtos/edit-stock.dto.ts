import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class EditStock {
  @IsNotEmpty()
  id!: string;

  @IsInt()
  @Min(0)
  newStock!: number;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  note?: string;
}
