import { ProductionLine } from "./production-line";
import { ProductionLineAssignment } from "./production-line-assignment";

export interface MachineStatistics {
    
    
    itemName: string;
    workOrderNumber: string;

    shiftStartTime: Date;
    shiftEndTime: Date;

    producedQuantity: number;
    pulseCount: number;

    achievementRate: number;
    shiftEstimationQuantity: number;
}
