import { WorkOrder } from './work-order';
import { WorkOrderLineConsumeTransaction } from './work-order-line-consume-transaction';
import { WorkOrderProducedInventory } from './work-order-produced-inventory';
import { BillOfMaterial } from './bill-of-material';
import { WorkOrderByProductProduceTransaction } from './work-order-by-product-produce-transaction';
import { WorkOrderKpi } from './work-order-kpi';
import { WorkOrderKpiTransaction } from './work-order-kpi-transaction';

export interface WorkOrderProduceTransaction {
  id: number;
  workOrder: WorkOrder;
  workOrderLineConsumeTransactions: WorkOrderLineConsumeTransaction[];
  workOrderProducedInventories: WorkOrderProducedInventory[];
  consumeByBomQuantity: boolean;
  matchedBillOfMaterial?: BillOfMaterial;
  workOrderByProductProduceTransactions: WorkOrderByProductProduceTransaction[];
  workOrderKPITransactions: WorkOrderKpiTransaction[];
}
