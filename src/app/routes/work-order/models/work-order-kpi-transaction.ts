import { KpiMeasurement } from './kpi-measurement.enum';
import { WorkOrder } from './work-order';
import { WorkOrderCompleteTransaction } from './work-order-complete-transaction';
import { WorkOrderKpi } from './work-order-kpi';
import { WorkOrderKpiTransactionType } from './work-order-kpi-transaction-type.enum';
import { WorkOrderProduceTransaction } from './work-order-produce-transaction';

export interface WorkOrderKpiTransaction {
  id?: number;

  username?: string;
  workingTeamName?: string;
  workOrderKPI?: WorkOrderKpi;

  kpiMeasurement?: KpiMeasurement;
  type?: WorkOrderKpiTransactionType;
  amount?: number;
  workOrder?: WorkOrder;
  workOrderCompleteTransaction?: WorkOrderCompleteTransaction;
  workOrderProduceTransaction?: WorkOrderProduceTransaction;
  createdTime?: Date;
}
