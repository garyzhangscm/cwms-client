import { WorkOrder } from './work-order';
import { KpiMeasurement } from './kpi-measurement.enum';

export interface WorkOrderKpi {
  id: number;

  workOrder: WorkOrder;

  username: string;
  workingTeamName: string;

  kpiMeasurement: KpiMeasurement;
  amount: number;
}
