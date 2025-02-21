import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { InventoryAdjustmentRequestStatus } from './inventory-adjustment-request-status.enum';
import { InventoryQuantityChangeType } from './inventory-quantity-change-type.enum';
import { InventoryStatus } from './inventory-status';
import { Item } from './item';
import { ItemPackageType } from './item-package-type';

export interface InventoryAdjustmentRequest {
  id: number;

  inventoryId: number;

  lpn: string;

  locationId: number;

  location: WarehouseLocation;
  item: Item;

  itemPackageType: ItemPackageType;
  quantity: number;
  newQuantity: number;
  virtual?: boolean;
  inventoryStatus: InventoryStatus;
  warehouseId: number;
  inventoryQuantityChangeType: InventoryQuantityChangeType;
  status: InventoryAdjustmentRequestStatus;
  requestedByUsername: string;
  requestedByDateTime: Date;
  processedByUsername: string;
  processedByDateTime: Date;
  documentNumber: string;
  comment: string;
}
