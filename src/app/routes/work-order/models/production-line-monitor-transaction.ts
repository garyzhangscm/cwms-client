import { ProductionLine } from "./production-line";
import { ProductionLineMonitor } from "./production-line-monitor";

export interface ProductionLineMonitorTransaction {
    
    productionLine: ProductionLine;

    startTime: Date;

    endTime: Date;

    active: boolean;

    lastCycleTime: number;

    averageCycleTime: number;

    
    createdTime: Date;
}
