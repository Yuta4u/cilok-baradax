import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { BaseParams } from '../../database/base.entity';
import { AddIngredientDto } from './dtos/add.dto';
import { startTransaction } from '../../decorators/database.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permission } from '../../decorators/auth.decorator';
import { UpdateStockDto } from './dtos/update-stock.dto';

@ApiBearerAuth('Authorization')
@Permission(['KARYAWAN'], ['SUPER_USER'])
@Controller({
  path: '/ingredient',
  version: '1',
})
export class IngredientController {
  public constructor(private readonly ingredientService: IngredientService) {}

  @Get()
  public async getAll(@Query() query: BaseParams) {
    const res = await this.ingredientService.getAll(query);
    return res;
  }

  @Post()
  public async addIngredient(@Body() payload: AddIngredientDto) {
    const res = await startTransaction(
      this.ingredientService,
      'addTransaction',
      payload,
    );
    return res;
  }

  @Put('/:id')
  public async updateStockIngredient(
    @Param('id') id: string,
    @Body() payload: UpdateStockDto,
  ) {
    const res = await startTransaction(
      this.ingredientService,
      'updateStockIngredientTransaction',
      id,
      payload,
    );
    return res;
  }
}
