import { Item } from './item';
import { ItemPackageType } from './item-package-type';
import { InventoryStatus } from './inventory-status';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { InventoryMovement } from './inventory-movement';
import { Warehouse } from '../../warehouse-layout/models/warehouse';

export interface Inventory {
  id: number;
  lpn: string;
  location: WarehouseLocation;
  locationName?: string;
  item: Item;
  virtual?: boolean;
  warehouseId?: number;
  warehouse?: Warehouse;
  itemPackageType: ItemPackageType;
  quantity: number;
  inventoryStatus: InventoryStatus;
  inventoryMovements?: InventoryMovement[];
}
