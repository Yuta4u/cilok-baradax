import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Transaction,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { Transactional } from '../../decorators/database.decorator';
import { UpdateStock } from './dtos/update-stock.dto';
import { AddProductDto } from './dtos/add-product.dto';
import { StockHistoriesService } from '../stock-history/stock-histories.service';

@Injectable()
export class ProductService {
  public constructor(
    private readonly dataSource: DataSource,
    private readonly stockHistoryService: StockHistoriesService,
  ) {}

  public async getAll(type: 'Semua' | 'Aman' | 'Menipis', q?: string) {
    const productRepo = this.dataSource.getRepository(ProductEntity);

    const qb = productRepo
      .createQueryBuilder('p')
      .select([
        'p.id as id',
        'p.name as name',
        'p.stock as stock',
        'p.minimalStock as minimalStock',
        'p.uom as uom',
        'p.price as price',
        'CASE WHEN p.stock >= p.minimalStock THEN true ELSE false END as status',
      ]);

    if (q) {
      qb.where('p.name ILIKE :q', { q: `%${q}%` });
    }
    if (type === 'Aman') {
      console.log('hit aman');

      qb.andWhere('p.stock >= p.minimalStock');
    }

    if (type === 'Menipis') {
      console.log('hit menipis');

      qb.andWhere('p.stock < p.minimalStock');
    }

    const result = await qb.getRawMany();

    return {
      message: 'Successfully! get products',
      statusCode: 200,
      success: true,
      data: result,
    };
  }

  @Transactional('dataSource')
  public async addProductTransaction(
    manager: EntityManager,
    payload: AddProductDto,
  ) {
    const productRepo = manager.getRepository(ProductEntity);

    const existing = await productRepo.findOne({
      where: { name: payload.name },
    });

    if (existing) {
      throw new Error('Product already exists');
    }

    try {
      const product = productRepo.create({
        ...payload,
        uom: 'PCS',
      });

      const saved = await productRepo.save(product);

      return saved;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const dbError = error as any;

        if (dbError.code === '23505') {
          throw new Error('Product already exists');
        }

        if (dbError.code === 'ER_DUP_ENTRY') {
          throw new Error('Product already exists');
        }
      }

      throw error;
    }
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

    await this.stockHistoryService.createTransaction(manager, {
      productId: payload.id,
      qty: payload.quantity,
      note: payload.type === 'dec' ? 'out' : 'in',
    });
  }
}
