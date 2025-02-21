import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ItemPackageType } from '../../inventory/models/item-package-type';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { WorkOrderByProduct } from './work-order-by-product';

export interface WorkOrderByProductProduceTransaction {
  id?: number;
  workOrderByProduct?: WorkOrderByProduct;
  lpn?: string;
  inventoryStatusId?: number;
  inventoryStatus?: InventoryStatus;
  itemPackageTypeId?: number;
  itemPackageType?: ItemPackageType;

  quantity?: number;
  locationId?: number;
  location?: WarehouseLocation;
}
