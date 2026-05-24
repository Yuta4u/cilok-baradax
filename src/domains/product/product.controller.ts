import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { UpdateStock } from './dtos/update-stock.dto';
import { startTransaction } from '../../decorators/database.decorator';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/product',
})
export class ProductController {
  public constructor(private readonly productService: ProductService) {}

  @Get()
  public async getAll() {
    const res = await this.productService.getAll();
    return res;
  }

  @Put('/stock')
  public async updateStock(@Body() payload: UpdateStock) {
    const res = await startTransaction(
      this.productService,
      'updateStockTransaction',
      payload,
    );
    return res;
  }
}
