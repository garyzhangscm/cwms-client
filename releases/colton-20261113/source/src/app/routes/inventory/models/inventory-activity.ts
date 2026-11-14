import { Client } from '../../common/models/client';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { InventoryActivityType } from './inventory-activity-type.enum';
import { InventoryStatus } from './inventory-status';
import { Item } from './item';
import { ItemPackageType } from './item-package-type';

export interface InventoryActivity {
  id: number;
  transactionId: string;
  transactionGroupId: string;
  lpn: string;
  locationId?: number;
  location?: WarehouseLocation;
  locationName?: string;
  item: Item;
  virtual?: boolean;
  warehouseId?: number;
  warehouse?: Warehouse;
  itemPackageType: ItemPackageType;
  quantity: number;
  inventoryStatus: InventoryStatus;

  type: InventoryActivityType;
  activityDateTime: Date;
  username: string;
  valueType: string;
  fromValue: string;
  toValue: string;
  documentNumber: string;
  comment: string;
  rfCode: string;

  clientId?: number;
  client?: Client;
}
