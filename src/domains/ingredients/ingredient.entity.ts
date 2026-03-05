import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';

@Entity({
  name: 'ingredients',
})
export class IngredientEntity extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
  })
  public name!: string;

  @Column({
    name: 'uom',
    type: 'varchar',
  })
  public uom!: string;

  @Column({
    name: 'stock',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  public stock!: number;

  @Column({
    name: 'minimal_stock',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 0,
  })
  public minimalStock!: number;

  @Column({
    name: 'price',
    type: 'int',
  })
  public price!: number;

  @Column({
    name: 'icon',
    type: 'varchar',
  })
  public icon!: string;
}

//    {
//             id: 1,
//             nama: "Tepung Tapioka",
//             satuan: "kg",
//             stok: 45,
//             minStok: 20,
//             harga: 12000,
//             kategori: "bahan_baku",
//             icon: "🌾",
//           },
