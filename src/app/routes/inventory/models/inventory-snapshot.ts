import { InventorySnapshotDetail } from "./inventory-snapshot-detail";
import { InventorySnapshotStatus } from "./inventory-snapshot-status.enum";

export interface InventorySnapshot {

    
    id: number;
    warehouseId: number;
    batchNumber: string;

    startTime: Date;
    completeTime: Date;

    status: InventorySnapshotStatus;

    inventorySnapshotDetails: InventorySnapshotDetail[];

    fileName: string;

}
