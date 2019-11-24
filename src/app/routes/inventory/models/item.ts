import { Client } from '../../common/models/client';
import { ItemFamily } from './item-family';
import { ItemUnitOfMeasure } from './item-unit-of-measure';

export interface Item {
  id: number;
  name: string;
  description: string;
  client?: Client;
  itemFamily?: ItemFamily;
  itemUnitOfMeasures: ItemUnitOfMeasure[];
  unitCost?: number;
}
