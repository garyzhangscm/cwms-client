import { WorkOrder } from './work-order';
import { WorkOrderByProductProduceTransaction } from './work-order-by-product-produce-transaction';
import { WorkOrderKpi } from './work-order-kpi';
import { WorkOrderKpiTransaction } from './work-order-kpi-transaction';
import { WorkOrderLineCompleteTransaction } from './work-order-line-complete-transaction';

export interface WorkOrderCompleteTransaction {
  id?: number;
  workOrder?: WorkOrder;
  workOrderLineCompleteTransactions: WorkOrderLineCompleteTransaction[];
  workOrderKPITransactions: WorkOrderKpiTransaction[];
  workOrderByProductProduceTransactions: WorkOrderByProductProduceTransaction[];
}
