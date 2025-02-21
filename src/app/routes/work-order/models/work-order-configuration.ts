import { ProductionShiftSchedule } from "./production-shift-schedule";
import { WorkOrderMaterialConsumeTiming } from "./work-order-material-consume-timing";

export interface WorkOrderConfiguration {
    
    id?: number;
    companyId: number;
    warehouseId: number;

    materialConsumeTiming: WorkOrderMaterialConsumeTiming;

    overConsumeIsAllowed: boolean;
    overProduceIsAllowed: boolean;
    autoRecordItemProductivity: boolean;

    productionShiftSchedules: ProductionShiftSchedule[];

}
