import { Warehouse } from "./warehouse";

export interface WarehouseConfiguration {
    
    id?: number;
    
    warehouse: Warehouse;
    
    threePartyLogisticsFlag: boolean;
}
