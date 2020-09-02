import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { AllocationStrategyType } from './allocation-strategy-type.enum';

export interface OrderLine {
  id: number;
  number: string;
  orderNumber: string;

  itemId: number;
  item: Item;

  expectedQuantity: number;
  openQuantity: number;
  inprocessQuantity: number;
  shippedQuantity: number;
  productionPlanInprocessQuantity: number;
  productionPlanProducedQuantity: number;
  allocationStrategyType: AllocationStrategyType;

  inventoryStatusId: number;
  inventoryStatus: InventoryStatus;
}
