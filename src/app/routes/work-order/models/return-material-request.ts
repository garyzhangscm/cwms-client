import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ItemPackageType } from '../../inventory/models/item-package-type';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';

export interface ReturnMaterialRequest {
  id?: number;
  lpn?: string;
  quantity?: number;
  inventoryStatusId?: number;
  inventoryStatus?: InventoryStatus;
  itemPackageTypeId?: number;
  itemPackageType?: ItemPackageType;

  locationId?: number;
  location?: WarehouseLocation;
}
