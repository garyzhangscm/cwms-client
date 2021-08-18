import { WorkOrderStatus } from "./work-order-status.enum";

export interface ProductionLineKanbanData {


    productionLineName: string;
    workOrderNumber: string;
    productionLineModel: string | null;
    itemName: string;

    productionLineTargetOutput: number;
    productionLineActualOutput: number;
    productionLineActualPutawayOutput: number;

    productionLineTotalTargetOutput: number;
    productionLineTotalActualOutput: number;
    productionLineTotalActualPutawayOutput: number;

    workOrderStatus: WorkOrderStatus | null;
    shift: string | null;
    percent: number;

    productionLineEnabled: boolean | null;


}
