import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, Transaction } from 'typeorm';
import { ProductEntity } from './product.entity';
import { Transactional } from '../../decorators/database.decorator';
import { UpdateStock } from './dtos/update-stock.dto';

@Injectable()
export class ProductService {
  public constructor(private readonly dataSource: DataSource) {}

  public async getAll() {
    const productRepo = this.dataSource.getRepository(ProductEntity);

    const result = await productRepo.find();

    return result;
  }

  @Transactional('dataSource')
  public async updateStockTransaction(
    manager: EntityManager,
    payload: UpdateStock,
  ) {
    const productRepo = manager.getRepository(ProductEntity);

    const product = await productRepo.findOne({
      where: { id: payload.id },
      select: ['id', 'stock'],
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    if (payload.type === 'dec' && product.stock < payload.quantity) {
      console.log(product.stock, payload.quantity);

      throw new BadRequestException(
        `Stok tidak mencukupi. Stok tersedia: ${product.stock}, dibutuhkan: ${payload.quantity}`,
      );
    }

    await productRepo
      .createQueryBuilder()
      .update(ProductEntity)
      .set({
        stock: () =>
          payload.type === 'inc'
            ? `stock + ${payload.quantity}`
            : `stock - ${payload.quantity}`,
      })
      .where('id = :id', { id: payload.id })
      .execute();
  }
}
