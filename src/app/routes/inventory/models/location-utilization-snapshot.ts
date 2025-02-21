import { LocationUtilizationSnapshotDetail } from "./location-utilization-snapshot-detail";

export interface LocationUtilizationSnapshot {

    
    id?: number;
    warehouseId: number;
    
    
    itemId: number;

    clientId?: number;

    netVolume: number;

    grossVolume: number;

    totalLocations: number;
    
    locationUtilizationSnapshotDetails: LocationUtilizationSnapshotDetail[];

    capacityUnit?: string;
}
