import { ItemUnitOfMeasure } from './item-unit-of-measure';

export interface ItemPackageType {
  id: number;
  name: string;
  description: string;
  itemUnitOfMeasures: ItemUnitOfMeasure[];
  warehouseId: number;
}
