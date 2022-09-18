import { ProductionLine } from "./production-line";
import { ProductionLineMonitor } from "./production-line-monitor";

export interface ProductionLineMonitorTransaction {
    
    id: number;

    warehouseId: number;

    productionLineMonitor: ProductionLineMonitor;

    productionLine: ProductionLine;


    cycleTime: number;
}
