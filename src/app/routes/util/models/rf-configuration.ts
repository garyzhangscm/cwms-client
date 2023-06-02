export interface RfConfiguration { 
    warehouseId: number;
    rfCode?: string;
    workOrderValidatePartialLPNPick?: boolean;
    pickToProductionLineInStage?: boolean;
    receiveToStage?: boolean;
    listPickBatchPicking?: boolean;
}
