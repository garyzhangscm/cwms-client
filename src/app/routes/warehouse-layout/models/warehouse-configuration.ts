import { PrintingStrategy } from "./printing-strategy.enum";
import { Warehouse } from "./warehouse";

export interface WarehouseConfiguration {
    
    id?: number;
    
    warehouse: Warehouse;
    
    threePartyLogisticsFlag: boolean;
    listPickEnabledFlag: boolean;

    printingStrategy?: PrintingStrategy;
}
