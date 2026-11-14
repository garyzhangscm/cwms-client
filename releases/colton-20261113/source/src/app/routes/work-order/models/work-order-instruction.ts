import { WorkOrder } from './work-order';

export interface WorkOrderInstruction {
  id?: number;
  workOrder: WorkOrder;
  sequence: number;
  instruction: string;
}
