import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';

export interface WorkOrderByProduct {
  id?: number;
  itemId?: number;
  item?: Item;

  expectedQuantity?: number;
  producedQuantity?: number;
  inventoryStatusId?: number;
  inventoryStatus?: InventoryStatus;
}
