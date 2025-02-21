import { WorkOrderFlowLine } from "./work-order-flow-line";

export interface WorkOrderFlow {
    id?: number;
 
    name: string;
    description: string;
    lines: WorkOrderFlowLine[];
}
