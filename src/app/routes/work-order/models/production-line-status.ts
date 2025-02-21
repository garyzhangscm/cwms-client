import { ProductionLine } from "./production-line";

export interface ProductionLineStatus {
    
    productionLine: ProductionLine;

    startTime: Date;

    endTime: Date;

    active: boolean;

    lastCycleTime: number;
    totalCycles: number;

    averageCycleTime: number;

    lastCycleHappensTiming: Date;
}
