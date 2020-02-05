import { WorkOrderLine } from './work-order-line';

import { WorkOrderInstruction } from './work-order-instruction';

import { ProductionLine } from './production-line';

import { Item } from '../../inventory/models/item';

import { Warehouse } from '../../warehouse-layout/models/warehouse';

import { WorkOrderAssignment } from './work-order-assignment';

export interface WorkOrder {
  id: number;
  number: string;
  workOrderLines: WorkOrderLine[];
  workOrderInstructions: WorkOrderInstruction[];
  productionLine: ProductionLine;
  itemId: number;
  item: Item;

  warehouseId: number;
  warehouse: Warehouse;
  expectedQuantity: number;
  producedQuantity: number;
  assignments: WorkOrderAssignment[];
}
