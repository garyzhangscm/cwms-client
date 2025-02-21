import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ItemPackageType } from '../../inventory/models/item-package-type';

export interface WorkOrderProducedInventory {
  id?: number;
  lpn?: string;
  quantity?: number;
  inventoryStatusId?: number;
  inventoryStatus?: InventoryStatus;
  itemPackageTypeId?: number;
  itemPackageType?: ItemPackageType;
}
