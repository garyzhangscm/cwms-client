import { ProductionLine } from "./production-line";
import { ProductionLineAssignment } from "./production-line-assignment";

export interface MachineStatistics {
    
    
    itemName: string;
    workOrderNumber: string;

    startTime: Date;
    endTime: Date;

    producedQuantity: number; 

    achievementRate: number;
    estimationQuantity: number;
    active: boolean;

}
