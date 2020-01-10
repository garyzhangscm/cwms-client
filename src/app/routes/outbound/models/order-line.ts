import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';

export interface OrderLine {
  id: number;
  number: string;

  itemId: number;
  item: Item;

  expectedQuantity: number;
  shippedQuantity: number;

  inventoryStatusId: number;
  inventoryStatus: InventoryStatus;
}
