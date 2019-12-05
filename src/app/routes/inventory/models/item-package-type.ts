import { ItemUnitOfMeasure } from './item-unit-of-measure';

export interface ItemPackageType {
  id: number;
  name: string;
  itemUnitOfMeasures: ItemUnitOfMeasure[];
}
