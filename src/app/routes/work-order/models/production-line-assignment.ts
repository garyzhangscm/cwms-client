import { ProductionLine } from "./production-line";
import { WorkOrder } from "./work-order";

export interface ProductionLineAssignment {

    id : number;

    productionLine: ProductionLine;

    workOrder: WorkOrder;
    quantity: number;


}
