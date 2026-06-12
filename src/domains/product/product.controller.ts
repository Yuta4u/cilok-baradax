import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { UpdateStock } from './dtos/update-stock.dto';
import { startTransaction } from '../../decorators/database.decorator';
import { AddProductDto } from './dtos/add-product.dto';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/product',
})
export class ProductController {
  public constructor(private readonly productService: ProductService) {}

  @Get()
  public async getAll(
    @Query('type') type: 'Semua' | 'Aman' | 'Menipis',
    @Query('q') q?: string,
  ) {
    const res = await this.productService.getAll(type, q);
    return res;
  }

  @Post()
  public async addProduct(@Body() payload: AddProductDto) {
    const res = await startTransaction(
      this.productService,
      'addProductTransaction',
      payload,
    );
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
