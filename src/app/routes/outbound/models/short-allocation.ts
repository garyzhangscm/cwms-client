import { Item } from '../../inventory/models/item';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { PickWork } from './pick-work';
import { ShortAllocationStatus } from './short-allocation-status.enum';

export interface ShortAllocation {
  id: number;

  warehouseId: number;
  warehouse: Warehouse;

  itemId: number;
  item: Item;

  picks: PickWork[];

  quantity: number;
  openQuantity: number;
  inprocessQuantity: number;
  deliveredQuantity: number;
  allocationCount: number;
  status: ShortAllocationStatus;
  lastAllocationDatetime: Date;

  orderNumber: string;
  workOrderNumber: string;

  
  color: string;
  productSize: string;
  style: string;

  inventoryAttribute1: string;
  inventoryAttribute2: string;
  inventoryAttribute3: string;
  inventoryAttribute4: string;
  inventoryAttribute5: string;
}
