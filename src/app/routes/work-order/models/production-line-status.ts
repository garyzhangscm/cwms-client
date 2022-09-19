import { ProductionLine } from "./production-line";

export interface ProductionLineStatus {
    
    productionLine: ProductionLine;

    startTime: Date;

    endTime: Date;

    active: boolean;

    lastCycleTime: number;

    averageCycleTime: number;

    lastCycleHappensTiming: Date;
}
