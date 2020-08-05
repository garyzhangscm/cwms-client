import { WorkOrder } from './work-order';
import { WorkOrderLineCompleteTransaction } from './work-order-line-complete-transaction';

export interface WorkOrderCompleteTransaction {
  id: number;
  workOrder: WorkOrder;
  workOrderLineCompleteTransactions: WorkOrderLineCompleteTransaction[];
}
