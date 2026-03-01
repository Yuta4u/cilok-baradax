import { IsOptional, IsString } from 'class-validator';
import {
  BeforeInsert,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { uuidv7 } from 'uuidv7';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  public updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  public deletedAt!: Date;

  @BeforeInsert()
  protected generateUUID() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}

export class BaseParams {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsString()
  @IsOptional()
  q?: string;

  @IsString()
  @IsOptional()
  public sd?: string;

  @IsString()
  @IsOptional()
  public ed?: string;

  @IsString()
  @IsOptional()
  public type?: 'INCOME' | 'EXPENSE';
}
