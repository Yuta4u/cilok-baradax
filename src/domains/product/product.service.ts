import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, ILike } from 'typeorm';
import { BaseParams } from '../../database/base.entity';
import { ProductEntity } from './product.entity';
import { Transactional } from '../../decorators/database.decorator';
import { AddProductDto } from './dtos/add.dto';
import { UpdateStockDto } from '../ingredients/dtos/update-stock.dto';

@Injectable()
export class ProductService {
  public constructor(private readonly dataSource: DataSource) {}

  public async getAll(query: BaseParams) {
    const productRepo = this.dataSource.getRepository(ProductEntity);

    // const page = Math.max(1, parseInt(query.page) || 1);
    // const limit = Math.max(1, parseInt(query.limit) || 10);

    const result = await productRepo.find({
      order: { createdAt: 'DESC' },
      where: {
        name: ILike(`%${query.q}%`),
      },
    });

    return result;
  }

  @Transactional('dataSource')
  public async addTransaction(manager: EntityManager, payload: AddProductDto) {
    const productRepo = manager.getRepository(ProductEntity);

    const exist = await productRepo.findOne({
      where: {
        name: payload.name,
      },
    });

    if (exist) {
      throw new BadRequestException('Product already exists');
    }

    const product = productRepo.create(payload);
    await productRepo.save(product);

    return {
      message: 'Successfully! add product',
      success: true,
      statusCode: 200,
    };
  }

  @Transactional('dataSource')
  public async updateStockProductTransaction(
    manager: EntityManager,
    id: string,
    payload: UpdateStockDto,
  ) {
    const productRepo = manager.getRepository(ProductEntity);
    const exist = await productRepo.findOne({
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
      throw new BadRequestException('Product not found');
    }

    await productRepo.save(exist);
    return {
      message: 'Successfully! update stock product',
      success: true,
      statusCode: 200,
    };
  }
}
