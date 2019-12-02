import { Client } from '../../common/models/client';
import { ItemFamily } from './item-family';
import { ItemUnitOfMeasure } from './item-unit-of-measure';
import { ItemPackageType } from './item-package-type';

export interface Item {
  id: number;
  name: string;
  description: string;
  client?: Client;
  itemFamily?: ItemFamily;
  itemPackageTypes: ItemPackageType[];
  unitCost?: number;
}
