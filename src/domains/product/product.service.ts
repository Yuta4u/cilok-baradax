import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductService {
  public constructor(private readonly dataSource: DataSource) {}
}
