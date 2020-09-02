import { WorkOrder } from './work-order';
import { KpiMeasurement } from './kpi-measurement.enum';
import { WorkOrderCompleteTransaction } from './work-order-complete-transaction';
import { WorkOrderProduceTransaction } from './work-order-produce-transaction';
import { WorkOrderKpiTransactionType } from './work-order-kpi-transaction-type.enum';

export interface WorkOrderKpiTransaction {
  id: number;

  username: string;
  workingTeamName: string;

  kpiMeasurement: KpiMeasurement;
  type: WorkOrderKpiTransactionType;
  amount: number;
  workOrder: WorkOrder;
  workOrderCompleteTransaction: WorkOrderCompleteTransaction;
  workOrderProduceTransaction: WorkOrderProduceTransaction;
  createdTime?: number[];
}
