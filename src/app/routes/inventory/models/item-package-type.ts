import { ItemUnitOfMeasure } from './item-unit-of-measure';

export interface ItemPackageType {
  id: number;
  code: string;
  itemUnitOfMeasures: ItemUnitOfMeasure[];
}
