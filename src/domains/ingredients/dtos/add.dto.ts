import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddIngredientDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  public name: string;

  @IsString()
  @IsNotEmpty({ message: 'Uom is required' })
  public uom: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Price is required' })
  public price: number;

  @IsString()
  @IsNotEmpty({ message: 'Icon is required' })
  public icon: string;
}
