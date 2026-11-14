import { WorkOrder } from "./work-order";

export interface WorkOrderFlowLine {
    
    id?: number;
    sequence: number;
    workOrder: WorkOrder;

}
