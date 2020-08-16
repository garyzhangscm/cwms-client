import { Item } from '../../inventory/models/item';
import { InventoryStatus } from '../../inventory/models/inventory-status';

export interface BillOfMaterialByProduct {
  id: number;

  expectedQuantity: number;

  itemId: number;
  item: Item;

  inventoryStatusId: number;
  inventoryStatus: InventoryStatus;
}
