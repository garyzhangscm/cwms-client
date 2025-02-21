export interface RfConfiguration { 
    warehouseId: number;
    rfCode?: string;
    workOrderValidatePartialLPNPick?: boolean;
    outboundOrderValidatePartialLPNPick?: boolean;
    pickToProductionLineInStage?: boolean;
    receiveToStage?: boolean;
    listPickBatchPicking?: boolean;
    
    printerName?: string;
    autoDepositForLpnWithSameDestination?: boolean;
}
