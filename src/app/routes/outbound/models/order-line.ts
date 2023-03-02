import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { AllocationStrategyType } from './allocation-strategy-type.enum';

export interface OrderLine {
  id?: number;
  number: string;
  orderNumber?: string;
  warehouseId?: number;

  itemId?: number;
  item?: Item;

  expectedQuantity: number;
  openQuantity: number;
  
  displayExpectedQuantity?: number;
  displayUnitOfMeasureForExpectedQuantity?: UnitOfMeasure;
  displayOpenQuantity?: number;
  displayUnitOfMeasureForOpenQuantity?: UnitOfMeasure;

  inprocessQuantity: number;
  shippedQuantity: number;
  productionPlanInprocessQuantity: number;
  productionPlanProducedQuantity: number;
  allocationStrategyType: AllocationStrategyType;

  inventoryStatusId?: number;
  inventoryStatus?: InventoryStatus;

  color?:string;
  productSize?:string;
  style?:string;
}
