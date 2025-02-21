import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';

export interface BillOfMaterialByProduct {
  id?: number;
  // Sequence is only used when creating new BOM, used as a primary key
  // when we need to remove an by product record that is just created but not persist yet
  sequence?: number;
  expectedQuantity: number;

  itemId?: number;
  item?: Item;

  inventoryStatusId?: number;
  inventoryStatus?: InventoryStatus;
}
