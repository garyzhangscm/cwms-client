import { ProductionLineAssignment } from "./production-line-assignment";
import { WorkOrderAssignment } from "./work-order-assignment";

export interface WorkOrderQcSample {
    
    id?: number;

    number: string;
    warehouseId: number;

    productionLineAssignment?: ProductionLineAssignment;

    imageUrls: string;
}
