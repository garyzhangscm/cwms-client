import { WorkOrderLabor } from "./work-order-labor";
import { WorkOrderLaborActivityType } from "./work-order-labor-activity-type";

export interface WorkOrderLaborActivityHistory {

    
    id: number;
    warehouseId: number;
    workOrderLabor: WorkOrderLabor;


    activityType: WorkOrderLaborActivityType;

    username: string;
    originalValue: string;
    newValue: string;
    activityTime: Date;
}
