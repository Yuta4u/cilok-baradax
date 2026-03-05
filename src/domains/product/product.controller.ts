import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { BaseParams } from '../../database/base.entity';
import { AddProductDto } from './dtos/add.dto';
import { startTransaction } from '../../decorators/database.decorator';
import { UpdateStockDto } from '../ingredients/dtos/update-stock.dto';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/product',
})
export class ProductController {
  public constructor(private readonly productService: ProductService) {}

  @Get()
  public async getAll(@Query() query: BaseParams) {
    const res = await this.productService.getAll(query);
    return res;
  }

  @Post()
  public async addProduct(@Body() payload: AddProductDto) {
    const res = await startTransaction(
      this.productService,
      'addTransaction',
      payload,
    );
    return res;
  }

  @Put('/:id')
  public async updateStockProduct(
    @Param('id') id: string,
    @Body() payload: UpdateStockDto,
  ) {
    const res = await startTransaction(
      this.productService,
      'updateStockProductTransaction',
      id,
      payload,
    );
    return res;
  }
}
