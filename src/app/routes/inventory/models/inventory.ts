import { Item } from './item';
import { ItemPackageType } from './item-package-type';
import { InventoryStatus } from './inventory-status';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { InventoryMovement } from './inventory-movement';

export interface Inventory {
  id: number;
  lpn: string;
  location: WarehouseLocation;
  item: Item;
  itemPackageType: ItemPackageType;
  quantity: number;
  inventoryStatus: InventoryStatus;
  inventoryMovements?: InventoryMovement[];
}
