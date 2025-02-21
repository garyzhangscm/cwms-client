import { WorkOrderLine } from "./work-order-line";

export interface ProductionLineAssignmentLine {
    
    workOrderLine: WorkOrderLine; 
    quantity: number;
    openQuantity: number;
}
