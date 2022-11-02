import { ProductionLine } from "./production-line";

export interface ProductionLineMonitor {
    
    id?: number;

    warehouseId: number;

    name: string;
    description: string;

    productionLine?: ProductionLine;

    lastHeartBeatTime?: Date;
}
