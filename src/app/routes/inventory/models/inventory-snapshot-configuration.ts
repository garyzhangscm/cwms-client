export interface InventorySnapshotConfiguration {
    
    id?: number;
    warehouseId: number;
    cron: string;
    locationUtilizationSnapshotCron: string;
}
