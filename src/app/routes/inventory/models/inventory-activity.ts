import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Item } from './item';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { ItemPackageType } from './item-package-type';
import { InventoryStatus } from './inventory-status';
import { InventoryActivityType } from './inventory-activity-type.enum';

export interface InventoryActivity {
  id: number;
  transactionId: string;
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

  type: InventoryActivityType;
  activityDateTime: number[];
  username: string;
  valueType: string;
  fromValue: string;
  toValue: string;
  documentNumber: string;
  comment: string;
}
