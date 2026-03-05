import { IsNotEmpty, IsString } from 'class-validator';

export class AddProductDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  public name: string;

  @IsString()
  @IsNotEmpty({ message: 'Uom is required' })
  public uom: string;

  @IsString()
  @IsNotEmpty({ message: 'Icon is required' })
  public icon: string;
}
