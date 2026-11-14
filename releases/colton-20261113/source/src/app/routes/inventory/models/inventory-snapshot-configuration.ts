export interface InventorySnapshotConfiguration {
    
    id?: number;
    warehouseId: number;
    cron?: string;
    locationUtilizationSnapshotCron?: string;

    inventorySnapshotTiming1?: number;
    inventorySnapshotTiming2?: number;
    inventorySnapshotTiming3?: number;

    locationUtilizationSnapshotTiming1?: number;
    locationUtilizationSnapshotTiming2?: number;
    locationUtilizationSnapshotTiming3?: number;


    inventoryAgingSnapshotTiming1?: number;
    inventoryAgingSnapshotTiming2?: number;
    inventoryAgingSnapshotTiming3?: number;
}
