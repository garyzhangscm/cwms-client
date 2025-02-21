import { ProductionLine } from "./production-line";
import { WorkOrderLaborStatus } from "./work-order-labor-status";

export interface WorkOrderLabor {
    
    id: number;

    warehouseId: number;

    username: string;
    productionLine: ProductionLine;

    lastCheckInTime: Date;
    lastCheckOutTime: Date;
    workOrderLaborStatus: WorkOrderLaborStatus;
}
