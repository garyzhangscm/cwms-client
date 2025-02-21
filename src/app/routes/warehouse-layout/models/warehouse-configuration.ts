import { PrintingStrategy } from "./printing-strategy.enum";
import { Warehouse } from "./warehouse";

export interface WarehouseConfiguration {
    
    id?: number;
    
    warehouse: Warehouse;
    
    threePartyLogisticsFlag: boolean;
    listPickEnabledFlag: boolean;

    printingStrategy?: PrintingStrategy;

    
    newLPNPrintLabelAtReceivingFlag: boolean;
    newLPNPrintLabelAtProducingFlag: boolean;
    newLPNPrintLabelAtAdjustmentFlag: boolean;
    
    reuseLPNAfterRemovedFlag: boolean;
    reuseLPNAfterShippedFlag: boolean;

    billingRequestEnabledFlag: boolean;
    
    // locationUtilizationSnapshotEnabled: boolean;
    // inventoryAgingSnapshotEnabled: boolean;
    
    workingOnSundayFlag: boolean;
    workingOnMondayFlag: boolean;
    workingOnTuesdayFlag: boolean;
    workingOnWednesdayFlag: boolean;
    workingOnThursdayFlag: boolean;
    workingOnFridayFlag: boolean;
    workingOnSaturdayFlag: boolean;

    timeZone?: string;
}
