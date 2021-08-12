import { Mould } from "./mould";
import { ProductionLine } from "./production-line";
import { ProductionLineAssignmentLine } from "./production-line-assignment-line";
import { WorkOrder } from "./work-order";

export interface ProductionLineAssignment {

    id?: number;

    productionLine: ProductionLine;

    workOrder: WorkOrder;
    quantity: number;
    openQuantity: number;
    mould?: Mould;

    startTime?: Date;
    endTime?: Date;
    dateRange?: Date[]

    lines: ProductionLineAssignmentLine[];

}
