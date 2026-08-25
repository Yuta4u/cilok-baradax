import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Transactional } from '../../decorators/database.decorator';
import { CashFlowItemEntity } from './cash-flow-item.entity';
import { ProductService } from '../product/product.service';

@Injectable()
export class CashFlowItemService {
  public constructor(
    private readonly dataSource: DataSource,
    private readonly productService: ProductService,
  ) {}

  @Transactional('dataSource')
  public async updateStockTransaction(
    manager: EntityManager,
    payload: Record<string, number>,
  ) {
    const cashFlowItemRepo = manager.getRepository(CashFlowItemEntity);

    for (const [id, qty] of Object.entries(payload)) {
      const cashFlowItem = await cashFlowItemRepo.findOne({
        where: { id },
        relations: {
          product: true,
        },
      });

      if (!cashFlowItem) {
        throw new NotFoundException('Cash flow item not found');
      }

      const gapQty = cashFlowItem.in - qty;

      if (gapQty > 0) {
        await this.productService.updateStockTransaction(manager, {
          id: cashFlowItem.product.id,
          type: 'inc',
          quantity: gapQty,
          note: 'cash flow item update',
        });
      } else {
        await this.productService.updateStockTransaction(manager, {
          id: cashFlowItem.product.id,
          type: 'dec',
          quantity: Math.abs(gapQty),
          note: 'cash flow item update',
        });
      }

      await cashFlowItemRepo.update({ id }, { in: qty });
    }

    return {
      message: 'success',
      statusCode: 200,
      success: true,
    };
  }
}
