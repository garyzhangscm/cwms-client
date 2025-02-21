export interface LocationUtilizationSnapshotDetail {
    
    id?: number;
    warehouseId: number;
    
    itemId: number;

    clientId?: number;

    netVolume: number;

    grossVolume: number;

    locationId: number;
    locationSize: number;

    capacityUnit?: string;
}
