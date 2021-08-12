import { ProductionLineAllocationRequestLine } from "./production-line-allocation-request-line";

export interface ProductionLineAllocationRequest {
    workOrderId: number;
    productionLineId: number;
    productionLineName: string;
    totalQuantity: number; // total assigned quantity, read from production line assignment
    openQuantity: number;  // total open quantity, read from production line assignment
    allocatingQuantity: number; // quantity to be allocated  
    allocateByLine: boolean; // whether we allocate by work order line or by whole work order
    lines: ProductionLineAllocationRequestLine[];
}
