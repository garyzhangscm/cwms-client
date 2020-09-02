import { WorkOrderLine } from './work-order-line';

import { WorkOrderInstruction } from './work-order-instruction';

import { ProductionLine } from './production-line';

import { Item } from '../../inventory/models/item';

import { Warehouse } from '../../warehouse-layout/models/warehouse';

import { WorkOrderAssignment } from './work-order-assignment';
import { WorkOrderStatus } from './work-order-status.enum';
import { WorkOrderKpi } from './work-order-kpi';
import { WorkOrderByProduct } from './work-order-by-product';
import { ProductionPlanLine } from './production-plan-line';

export interface WorkOrder {
  id: number;
  number: string;
  workOrderLines: WorkOrderLine[];
  workOrderInstructions: WorkOrderInstruction[];
  productionLine: ProductionLine;
  itemId: number;
  item: Item;
  productionPlanLine?: ProductionPlanLine; // When we create a work order from a production line

  warehouseId: number;
  warehouse: Warehouse;
  expectedQuantity: number;
  producedQuantity: number;
  assignments: WorkOrderAssignment[];
  workOrderKPIs: WorkOrderKpi[];
  workOrderByProducts: WorkOrderByProduct[];

  status: WorkOrderStatus;

  totalLineExpectedQuantity?: number;
  totalLineOpenQuantity?: number;
  totalLineInprocessQuantity?: number;
  totalLineDeliveredQuantity?: number;
  totalLineConsumedQuantity?: number;
}
