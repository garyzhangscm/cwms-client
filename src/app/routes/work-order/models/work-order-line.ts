import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { AllocationStrategyType } from '../../outbound/models/allocation-strategy-type.enum';
import { PickWork } from '../../outbound/models/pick-work';
import { ShortAllocation } from '../../outbound/models/short-allocation';
import { WorkOrderLineSparePart } from './work-order-line-spare-part';

export interface WorkOrderLine {
  id?: number;
  number?: string;
  itemId?: number;
  item?: Item;

  expectedQuantity?: number;
  openQuantity?: number;
  inprocessQuantity?: number;
  deliveredQuantity?: number;
  consumedQuantity?: number;
  scrappedQuantity?: number;
  returnedQuantity?: number;
  sparePartQuantity?:number;

  inventoryStatusId?: number;
  inventoryStatus?: InventoryStatus;

  allocationStrategyType?: AllocationStrategyType;

  picks?: PickWork[];
  shortAllocations?: ShortAllocation[];
  workOrderNumber?: string;
  workOrderLineSpareParts?: WorkOrderLineSparePart[];
}
