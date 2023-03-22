import { Client } from "../../common/models/client";
import { LocationUtilizationSnapshot } from "./location-utilization-snapshot";

export interface ClientLocationUtilizationSnapshotBatch {
    
    id?: number;
    warehouseId: number;
    

    clientId?: number;
    client?: Client;

    netVolume: number;

    grossVolume: number;
 
    totalLocations: number;
    totalLPNs: number;
    
    locationUtilizationSnapshots: LocationUtilizationSnapshot[];

    
    capacityUnit?: string;
}
