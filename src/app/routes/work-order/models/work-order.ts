

import { Customer } from '../../common/models/customer';
import { Item } from '../../inventory/models/item';
import { Order } from '../../outbound/models/order';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { BillOfMaterial } from './bill-of-material';
import { ProductionLine } from './production-line';
import { ProductionLineAssignment } from './production-line-assignment';
import { ProductionPlanLine } from './production-plan-line';
import { WorkOrderAssignment } from './work-order-assignment';
import { WorkOrderByProduct } from './work-order-by-product';
import { WorkOrderInstruction } from './work-order-instruction';
import { WorkOrderKpi } from './work-order-kpi';
import { WorkOrderLine } from './work-order-line';
import { WorkOrderMaterialConsumeTiming } from './work-order-material-consume-timing';
import { WorkOrderStatus } from './work-order-status.enum';

export interface WorkOrder {
  id?: number;
  number?: string;
  workOrderLines: WorkOrderLine[];
  workOrderInstructions: WorkOrderInstruction[];
  productionLineAssignments?: ProductionLineAssignment[];
  itemId?: number;
  item?: Item;
  productionPlanLine?: ProductionPlanLine; // When we create a work order from a production line

  warehouseId?: number;
  warehouse?: Warehouse;
  expectedQuantity?: number;
  producedQuantity?: number;
  assignments: WorkOrderAssignment[];
  workOrderKPIs: WorkOrderKpi[];
  workOrderByProducts: WorkOrderByProduct[];

  status?: WorkOrderStatus;

  totalLineExpectedQuantity?: number;
  totalLineOpenQuantity?: number;
  totalLineInprocessQuantity?: number;
  totalLineDeliveredQuantity?: number;
  totalLineConsumedQuantity?: number;

  billOfMaterial?: BillOfMaterial; // if the work order is created from the BOM

  consumeByBomOnly? : boolean;
  consumeByBom?: BillOfMaterial;  // the user can specify a bom to consume the material
  materialConsumeTiming?: WorkOrderMaterialConsumeTiming;

  
  qcQuantity?: number;

  qcPercentage?: number;
  qcQuantityRequested?: number;
  qcQuantityCompleted?: number;

  btoOutboundOrderId?: number;
  btoOutboundOrder?: Order;
  btoCustomerId?: number;
  btoCustomer?: Customer;
}
