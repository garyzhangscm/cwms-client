import { WorkOrder } from './work-order';
import { WorkOrderLineConsumeTransaction } from './work-order-line-consume-transaction';
import { WorkOrderProducedInventory } from './work-order-produced-inventory';
import { BillOfMaterial } from './bill-of-material';

export interface WorkOrderProduceTransaction {
  id: number;
  workOrder: WorkOrder;
  workOrderLineConsumeTransactions: WorkOrderLineConsumeTransaction[];
  workOrderProducedInventories: WorkOrderProducedInventory[];
  consumeByBomQuantity: boolean;
  matchedBillOfMaterial?: BillOfMaterial;
}
