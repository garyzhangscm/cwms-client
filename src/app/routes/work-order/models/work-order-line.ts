import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { AllocationStrategyType } from '../../outbound/models/allocation-strategy-type.enum';
import { PickWork } from '../../outbound/models/pick-work';
import { ShortAllocation } from '../../outbound/models/short-allocation';

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

  inventoryStatusId?: number;
  inventoryStatus?: InventoryStatus;

  allocationStrategyType?: AllocationStrategyType;

  picks: PickWork[];
  shortAllocations: ShortAllocation[];
  workOrderNumber?: string;
}
