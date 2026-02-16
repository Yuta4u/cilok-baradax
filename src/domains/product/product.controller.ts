import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/product',
})
export class ProductController {
  public constructor(private readonly productService: ProductService) {}
}
