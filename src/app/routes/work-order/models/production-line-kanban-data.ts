import { WorkOrderStatus } from "./work-order-status.enum";

export interface ProductionLineKanbanData {


    productionLineName: string;
    workOrderNumber: string;
    productionLineModel: string | null;

    productionLineTargetOutput: number;
    productionLineActualOutput: number;

    productionLineTotalTargetOutput: number;
    productionLineTotalActualOutput: number;

    workOrderStatus: WorkOrderStatus | null;
    shift: string | null;
    percent: number;


}
