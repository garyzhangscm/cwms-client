import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';

export interface OrderLine {
  id: number;
  number: string;
  orderNumber: string;

  itemId: number;
  item: Item;

  expectedQuantity: number;
  openQuantity: number;
  inprocessQuantity: number;
  shippedQuantity: number;

  inventoryStatusId: number;
  inventoryStatus: InventoryStatus;
}
