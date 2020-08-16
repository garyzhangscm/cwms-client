import { WorkOrder } from './work-order';
import { WorkOrderLineCompleteTransaction } from './work-order-line-complete-transaction';
import { WorkOrderKpi } from './work-order-kpi';
import { WorkOrderByProductProduceTransaction } from './work-order-by-product-produce-transaction';
import { WorkOrderKpiTransaction } from './work-order-kpi-transaction';

export interface WorkOrderCompleteTransaction {
  id: number;
  workOrder: WorkOrder;
  workOrderLineCompleteTransactions: WorkOrderLineCompleteTransaction[];
  workOrderKPITransactions: WorkOrderKpiTransaction[];
  workOrderByProductProduceTransactions: WorkOrderByProductProduceTransaction[];
}
