import { Item } from '../../inventory/models/item';

export interface ShortAllocation {
  id: number;

  itemId: number;
  item: Item;
  quantity: number;
}
