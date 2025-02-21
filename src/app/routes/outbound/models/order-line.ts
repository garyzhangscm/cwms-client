import { Client } from '../../common/models/client';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { AllocationStrategyType } from './allocation-strategy-type.enum';
import { OrderLineBillableActivity } from './order-line-billable-activity';

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
  allocateByReceiptNumber?: string;

  orderLineBillableActivities: OrderLineBillableActivity[];
  autoRequestShippingLabel?: boolean;
  hualeiProductId?: string;

  
  clientId?: number;
  client?: Client;

  
  inventoryAttribute1?: string;
  inventoryAttribute2?: string;
  inventoryAttribute3?: string;
  inventoryAttribute4?: string;
  inventoryAttribute5?: string;
}
