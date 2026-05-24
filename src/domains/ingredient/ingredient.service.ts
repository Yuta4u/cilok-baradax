import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, ILike } from 'typeorm';
import { BaseParams } from '../../database/base.entity';
import { IngredientEntity } from './ingredient.entity';
import { AddIngredientDto } from './dtos/add.dto';
import { Transactional } from '../../decorators/database.decorator';
import { UpdateStockDto } from './dtos/update-stock.dto';

@Injectable()
export class IngredientService {
  public constructor(private readonly dataSource: DataSource) {}

  public async getAll(query: BaseParams) {
    const repo = this.dataSource.getRepository(IngredientEntity);
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, parseInt(query.limit) || 10);

    return repo.find({
      order: { createdAt: 'DESC' },
      where: {
        name: ILike(`%${query.q}%`),
      },
    });
  }

  @Transactional('dataSource')
  public async addTransaction(
    manager: EntityManager,
    payload: AddIngredientDto,
  ) {
    const ingredientRepo = manager.getRepository(IngredientEntity);

    const exist = await ingredientRepo.findOne({
      where: {
        name: payload.name,
      },
    });

    if (exist) {
      throw new BadRequestException('Ingredient already exists');
    }

    const ingredient = ingredientRepo.create(payload);
    await ingredientRepo.save(ingredient);

    return {
      message: 'Successfully! add ingredient',
      success: true,
      statusCode: 200,
    };
  }

  @Transactional('dataSource')
  public async updateStockIngredientTransaction(
    manager: EntityManager,
    id: string,
    payload: UpdateStockDto,
  ) {
    const ingredientRepo = manager.getRepository(IngredientEntity);
    const exist = await ingredientRepo.findOne({
      where: {
        id: id,
      },
    });

    if (payload.type) {
      exist.stock = Number(exist.stock) + payload.quantity;
    } else {
      exist.stock = Number(exist.stock) - payload.quantity;
    }

    if (exist.stock < 0) {
      throw new BadRequestException('Quantity is not enough');
    }
    if (!exist) {
      throw new BadRequestException('Ingredient not found');
    }

    await ingredientRepo.save(exist);
    return {
      message: 'Successfully! update stock ingredient',
      success: true,
      statusCode: 200,
    };
  }

  @Transactional('dataSource')
  public async updateMinimalStockTransaction(
    manager: EntityManager,
    id: string,
    minimalStock: number,
  ) {
    const ingredientRepo = manager.getRepository(IngredientEntity);

    if (!minimalStock) {
      throw new BadRequestException('Minimal stock is required');
    }

    await ingredientRepo.update(id, { minimalStock });
    return {
      message: 'Successfully! update minimal stock ingredient',
      success: true,
      statusCode: 200,
    };
  }
}
