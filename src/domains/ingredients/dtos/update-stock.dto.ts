import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateStockDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Quantity is required' })
  public quantity: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Type is required' })
  public type: number;
}
