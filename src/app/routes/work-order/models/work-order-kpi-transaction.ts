import { WorkOrder } from './work-order';
import { KpiMeasurement } from './kpi-measurement.enum';
import { WorkOrderCompleteTransaction } from './work-order-complete-transaction';
import { WorkOrderProduceTransaction } from './work-order-produce-transaction';

export interface WorkOrderKpiTransaction {
  id: number;

  username: string;
  workingTeamName: string;

  kpiMeasurement: KpiMeasurement;
  amount: number;
  workOrder: WorkOrder;
  workOrderCompleteTransaction: WorkOrderCompleteTransaction;
  workOrderProduceTransaction: WorkOrderProduceTransaction;
  createdTime?: number[];
}
