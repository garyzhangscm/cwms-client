import { Client } from '../../common/models/client';
import { PickWork } from '../../outbound/models/pick-work';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { WorkOrder } from '../../work-order/models/work-order';
import { InventoryMovement } from './inventory-movement';
import { InventoryStatus } from './inventory-status';
import { Item } from './item';
import { ItemPackageType } from './item-package-type';

export interface Inventory {
  id?: number;
  lpn?: string;
  client?: Client;
  clientId?: number;
  locationId?: number;
  location?: WarehouseLocation;
  locationName?: string;
  item?: Item;
  virtual?: boolean;
  warehouseId?: number;
  warehouse?: Warehouse;
  itemPackageType?: ItemPackageType;
  quantity?: number;
  displayQuantity?:number; // quantity by the display UOM
  inventoryStatus?: InventoryStatus;
  inventoryMovements?: InventoryMovement[];
  lockedForAdjust?: boolean;

  pickId?: number;
  pick?: PickWork;
  allocatedByPickId?: number;
  allocatedByPick?: PickWork;

  receiptId?: number;
  receiptLineId?: number;
  inboundQCRequired?: boolean;

  workOrderId? : number;
  workOrder?: WorkOrder;

  fifoDate?: Date;
  
  color?: string;
  productSize?: string;
  style?: string;
}
