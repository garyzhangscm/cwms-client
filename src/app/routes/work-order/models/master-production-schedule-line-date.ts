export interface MasterProductionScheduleLineDate {

    
    id?: number;
 
    plannedQuantity: number;

    plannedDate: Date;

    // used for MPS display
    productionLineName?: string;
    productionLineId?: number; 
    itemName?: string;   
    itemId?: number;
    mpsNumber?: string,   

}
