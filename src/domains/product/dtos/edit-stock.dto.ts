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

  @IsOptional()
  @IsInt()
  @Min(0)
  newStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimalStock?: number;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  note?: string;
}
