import { ProductionLine } from "./production-line";
import { ProductionLineAssignment } from "./production-line-assignment";
import { WorkOrder } from "./work-order";
import { WorkOrderAssignment } from "./work-order-assignment";

export interface WorkOrderQcSample {
    
    id?: number;

    number: string;
    warehouseId: number;

    productionLineAssignment?: ProductionLineAssignment;
    workOrder?: WorkOrder;
    productionLine?: ProductionLine;

    imageUrls: string;
}
