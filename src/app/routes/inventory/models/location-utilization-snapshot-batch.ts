import { ClientLocationUtilizationSnapshotBatch } from "./client-location-utilization-snapshot-batch";
import { LocationUtilizationSnapshotStatus } from "./location-utilization-snapshot-status.enum";

export interface LocationUtilizationSnapshotBatch {
    
    id?: number;
      

    warehouseId: number;
    number: string;

    netVolume: number;

    grossVolume: number;
 
    totalLocations: number;
    totalLPNs: number;
    startTime: Date;
    
    completeTime: Date;
    status: LocationUtilizationSnapshotStatus;
    clientLocationUtilizationSnapshotBatches: ClientLocationUtilizationSnapshotBatch[];

    capacityUnit?: string;
}
