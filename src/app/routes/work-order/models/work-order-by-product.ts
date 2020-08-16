import { Item } from '../../inventory/models/item';
import { InventoryStatus } from '../../inventory/models/inventory-status';

export interface WorkOrderByProduct {
  id: number;
  itemId: number;
  item: Item;

  expectedQuantity: number;
  producedQuantity: number;
  inventoryStatusId: number;
  inventoryStatus: InventoryStatus;
}
