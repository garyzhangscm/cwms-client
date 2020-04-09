import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { InventoryAdjustmentRequestStatus } from './inventory-adjustment-request-status.enum';
import { InventoryQuantityChangeType } from './inventory-quantity-change-type.enum';
import { Item } from './item';
import { ItemPackageType } from './item-package-type';
import { InventoryStatus } from './inventory-status';

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
  requestedByDateTime: number[];
  processedByUsername: string;
  processedByDateTime: number[];
  documentNumber: true;
  comment: string;
}
