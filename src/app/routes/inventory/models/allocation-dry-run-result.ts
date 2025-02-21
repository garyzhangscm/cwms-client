 
import { Inventory } from './inventory';
import { InventoryStatus } from './inventory-status';
import { Item } from './item';

export interface AllocationDryRunResult { 
  warehouseId?: number;
   

  // requested Item and inventory status
  item: Item;
  inventoryStatus: InventoryStatus;

  // result of the dry run on certain inventory
  inventory: Inventory;

  locationName: string;

  
  locationInventoryQuantity: number;
  locationOpenPickQuantity: number;
  
  allocatible: boolean;

  // only if the inventory is not allocatible based on the
  // requirement
  allocationFailReason: string;
}
