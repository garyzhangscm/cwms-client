export interface ProductionLineAllocationRequestLine {
    workOrderLineId: number;
    totalQuantity: number; // total assigned quantity, read from production line assignment
    openQuantity: number;  // total open quantity, read from production line assignment
    allocatingQuantity: number; // quantity to be allocated  
    itemName: string;
    itemDescription?: string;
    workOrderLineNumber: string;
    productionLineName: string;
    
}
